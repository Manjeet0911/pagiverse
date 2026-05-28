import os
import shutil
import uuid
import json
import time
import asyncio
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app import models, schemas, database, services

# CORE STRUCTURAL UPDATE: Server boot sequence wrapped in a safe block to prevent reloader crashes.
try:
    models.Base.metadata.create_all(bind=database.engine)
    print("--- SUCCESS: Database schemas verified and synced safely ---")
except Exception as boot_err:
    print(f"--- WARNING: Database tables couldn't sync during boot ({str(boot_err)}). Will connect lazily. ---")

app = FastAPI(title="Pagiverse Engine - Production Ready")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("temp_uploads", exist_ok=True)

# Helper function to asynchronously process individual chunk tasks
async def process_single_chunk_async(chunk_text: str, chunk_index: int):
    """
    Wraps the AI insight generation service in an async thread loop 
    with built-in exponential backoff retry matrix to bypass 503 errors.
    """
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"--> Initializing Parallel Gemini Task for Chunk Node #{chunk_index + 1} (Attempt {attempt + 1})")
            
            # 🔥 FIX 503: Give Gemini a slight breathing window between burst requests
            await asyncio.sleep(attempt * 1.5 + 0.5)
            
            loop = asyncio.get_event_loop()
            raw_insights = await loop.run_in_executor(None, services.generate_insights_from_ai, chunk_text)
            
            if isinstance(raw_insights, str):
                try:
                    return json.loads(raw_insights.strip())
                except Exception:
                    return {"summary": raw_insights}
            return raw_insights if isinstance(raw_insights, dict) else {}
            
        except Exception as chunk_err:
            print(f"!!! Warning on Chunk Node #{chunk_index + 1} Attempt {attempt + 1}: {str(chunk_err)}")
            if attempt == max_retries - 1:
                print(f"!!! Fatal: Chunk Node #{chunk_index + 1} failed all retries.")
                return {}
    return {}

async def process_pdf_task_async(doc_id: str, file_path: str):
    db = database.SessionLocal()
    try:
        print(f"--- Asynchronous High-Performance Chunk Ingestion for ID: {doc_id} ---")
        
        # 1. Extract raw textual streams from target document binary data
        full_text_data = services.extract_text_from_pdf(file_path)
        
        # 2. CHUNKING ENGINE LOGIC: Split long text blocks into smaller 5-page token constraints
        paragraphs = full_text_data.split('\n')
        chunks = []
        current_chunk = []
        current_word_count = 0
        
        for para in paragraphs:
            current_chunk.append(para)
            current_word_count += len(para.split())
            if current_word_count >= 1500:
                chunks.append("\n".join(current_chunk))
                current_chunk = []
                current_word_count = 0
        if current_chunk:
            chunks.append("\n".join(current_chunk))

        print(f"--- Document Vector divided dynamically into {len(chunks)} Chunks. Spawning Parallel AI Workers ---")

        # 3. SEMAPHORE ENGINE CONCURRENCY: Limit to 2 concurrent burst threads to strictly prevent Gemini 503 Spikes
        semaphore = asyncio.Semaphore(2)
        
        async def bounded_chunk_worker(chunk_text, index):
            async with semaphore:
                return await process_single_chunk_async(chunk_text, index)
                
        tasks = [bounded_chunk_worker(chunk, idx) for idx, chunk in enumerate(chunks)]
        insights_results = await asyncio.gather(*tasks)

        # 4. MASTER ANALYSIS AGGREGATOR: Merge fragmented matrices securely back into single dataset fields
        aggregated_summary_blocks = []
        merged_key_points = []
        merged_timeline_dates = []
        merged_historians_quotes = []
        merged_cheat_sheet = []
        merged_flashcards = []

        for idx, chunk_data in enumerate(insights_results):
            if not chunk_data:
                continue
                
            chunk_summary = chunk_data.get("summary")
            if chunk_summary:
                # 🔥 FIX CRASH: Changed JS String() constructor mapping to pure Python native str() handler string injection
                aggregated_summary_blocks.append(f"### PAGE BLOCK {str(idx+1).zfill(2)} INSIGHTS\n{chunk_summary.strip()}")
            
            if isinstance(chunk_data.get("key_points"), list):
                merged_key_points.extend(chunk_data["key_points"])
            if isinstance(chunk_data.get("timeline_dates"), list):
                merged_timeline_dates.extend(chunk_data["timeline_dates"])
            if isinstance(chunk_data.get("historians_quotes"), list):
                merged_historians_quotes.extend(chunk_data["historians_quotes"])
            if isinstance(chunk_data.get("cheat_sheet"), list):
                merged_cheat_sheet.extend(chunk_data["cheat_sheet"])
            if isinstance(chunk_data.get("flashcards"), list):
                merged_flashcards.extend(chunk_data["flashcards"])

        final_summary_string = "\n\n".join(aggregated_summary_blocks)
        if not final_summary_string:
            final_summary_string = "Processing block completed. Structural data isolated."

        print(f"--- AI Grid Sync Successful. Spawning Fresh Database Commit for ID: {doc_id} ---")

        # Network connection auto-recovery ping loop
        for retry in range(3):
            try:
                db.execute(text("SELECT 1"))
                break
            except Exception:
                db.close()
                await asyncio.sleep(1.5)
                db = database.SessionLocal()

        analytics = models.Analytics(
            document_id=doc_id,
            summary=str(final_summary_string).strip(),
            key_points=json.dumps(merged_key_points),
            timeline_dates=json.dumps(merged_timeline_dates),
            historians_quotes=json.dumps(merged_historians_quotes),
            cheat_sheet=json.dumps(merged_cheat_sheet),
            flashcards=json.dumps(merged_flashcards)
        )
        db.add(analytics)
        
        doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
        if doc: 
            doc.status = "completed"
            
        db.commit()
        print(f"--- SUCCESS: Row parameters synchronized safely with Ledger. ID: {doc_id} ---")
            
    except Exception as e:
        db.rollback()
        print(f"!!! Error in async worker core pipeline: {str(e)} !!!")
        try:
            db.close()
            db = database.SessionLocal()  
            doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
            if doc:
                doc.status = "failed"
                db.commit()
        except Exception as fallback_err:
            print(f"!!! Secondary disaster recovery block failed: {str(fallback_err)} !!!")
    finally:
        db.close()
        if os.path.exists(file_path): 
            try:
                os.remove(file_path)
                print(f"--- Temporary cache cleanup successful: {file_path} ---")
            except:
                pass

def process_pdf_task(doc_id: str, file_path: str):
    """Bridge interface matching older synchronous signature to fire async handler chain natively."""
    asyncio.run(process_pdf_task_async(doc_id, file_path))

@app.post("/upload", response_model=schemas.DocumentResponse)
async def upload_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        from app.database import SessionLocal
        db = SessionLocal()

    try:
        doc_id = str(uuid.uuid4())
        doc = models.Document(id=doc_id, filename=file.filename, user_id=1)
        db.add(doc)
        db.commit()
        db.refresh(doc)
        
        file_path = f"temp_uploads/{doc.id}.pdf"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        background_tasks.add_task(process_pdf_task, doc.id, file_path)
        return doc
    finally:
        db.close()

@app.get("/user/documents", response_model=list[schemas.DocumentResponse])
def get_user_documents(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        from app.database import SessionLocal
        db = SessionLocal()
        
    try:
        return db.query(models.Document).order_by(models.Document.created_at.desc()).all()
    finally:
        db.close()

@app.get("/document/{doc_id}", response_model=schemas.DocumentResponse)
def get_document_status(doc_id: str, db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        from app.database import SessionLocal
        db = SessionLocal()
        
    try:
        return db.query(models.Document).filter(models.Document.id == doc_id).first()
    finally:
        db.close()

@app.get("/document/{doc_id}/analytics", response_model=schemas.DocumentAnalyticsResponse)
def get_document_analytics(doc_id: str, db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        from app.database import SessionLocal
        db = SessionLocal()

    try:
        analytics = db.query(models.Analytics).filter(models.Analytics.document_id == doc_id).first()
        if not analytics: 
            raise HTTPException(status_code=404, detail="Rendering...")
        
        try:
            kp = json.loads(analytics.key_points) if analytics.key_points else []
            td = json.loads(analytics.timeline_dates) if analytics.timeline_dates else []
            hq = json.loads(analytics.historians_quotes) if analytics.historians_quotes else []
            cs = json.loads(analytics.cheat_sheet) if analytics.cheat_sheet else []
            fc = json.loads(analytics.flashcards) if analytics.flashcards else []
        except Exception:
            kp, td, hq, cs, fc = [], [], [], [], []

        return {
            "summary": analytics.summary or "",
            "key_points": kp,
            "timeline_dates": td,
            "historians_quotes": hq,
            "cheat_sheet": cs,
            "flashcards": fc
        }
    finally:
        db.close()

@app.delete("/document/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        from app.database import SessionLocal
        db = SessionLocal()
        
    try:
        db.query(models.Analytics).filter(models.Analytics.document_id == doc_id).delete()
        db.query(models.Document).filter(models.Document.id == doc_id).delete()
        db.commit()
        return {"message": "Purged successfully."}
    finally:
        db.close()
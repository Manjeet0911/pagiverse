import os
import shutil
import uuid
import json
import time
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

def process_pdf_task(doc_id: str, file_path: str):
    db = database.SessionLocal()
    try:
        print(f"--- Asynchronous Processing Ingested for ID: {doc_id} ---")
        text_data = services.extract_text_from_pdf(file_path)
        insights = services.generate_insights_from_ai(text_data)
        
        if isinstance(insights, str):
            try:
                insights = json.loads(insights.strip())
            except Exception:
                pass

        final_summary = insights.get("summary") if isinstance(insights, dict) else None
        final_key_points = insights.get("key_points", []) if isinstance(insights, dict) else []
        final_timeline_dates = insights.get("timeline_dates", []) if isinstance(insights, dict) else []
        final_historians_quotes = insights.get("historians_quotes", []) if isinstance(insights, dict) else []
        final_cheat_sheet = insights.get("cheat_sheet", []) if isinstance(insights, dict) else []
        final_flashcards = insights.get("flashcards", []) if isinstance(insights, dict) else []

        if not final_summary:
            final_summary = "Processing block completed. Structural data isolated."

        print(f"--- AI Processing Finished. Spawning Fresh Database Commit for ID: {doc_id} ---")

        # Network connection auto-recovery ping loop
        for retry in range(3):
            try:
                db.execute(text("SELECT 1"))
                break
            except Exception:
                db.close()
                time.sleep(1.5)
                db = database.SessionLocal()

        analytics = models.Analytics(
            document_id=doc_id,
            summary=str(final_summary).strip(),
            key_points=json.dumps(final_key_points),
            timeline_dates=json.dumps(final_timeline_dates),
            historians_quotes=json.dumps(final_historians_quotes),
            cheat_sheet=json.dumps(final_cheat_sheet),
            flashcards=json.dumps(final_flashcards)
        )
        db.add(analytics)
        
        doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
        if doc: 
            doc.status = "completed"
            
        db.commit()
        print(f"--- SUCCESS: Row parameters synchronized safely with Ledger. ID: {doc_id} ---")
            
    except Exception as e:
        db.rollback()
        print(f"!!! Error in worker thread: {str(e)} !!!")
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
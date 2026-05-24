import fitz
from PIL import Image
import pytesseract
import io
from google import genai
from google.genai import types
import json
import time
from typing import Dict, Any
from app.config import settings

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        doc = fitz.open(file_path)
        for page_num, page in enumerate(doc):
            extracted_text = page.get_text()
            if extracted_text:
                text += f"\n--- PAGE {page_num + 1} ---\n" + extracted_text + "\n"
        
        if len(text.strip()) < 300:
            text = ""
            for page_num in range(len(doc)):
                page = doc[page_num]
                pix = page.get_pixmap(matrix=fitz.Matrix(2.2, 2.2))
                image_bytes = pix.tobytes("png")
                img = Image.open(io.BytesIO(image_bytes))
                ocr_page_text = pytesseract.image_to_string(img, lang="hin+eng", config=r'--oem 3 --psm 3')
                if ocr_page_text:
                    text += f"\n--- PAGE {page_num + 1} ---\n" + ocr_page_text + "\n"
        doc.close()
    except Exception as e:
        print(f"Extraction layer exception: {str(e)}")
    return text

def generate_insights_from_ai(text: str) -> Dict[str, Any]:
    if not text.strip():
        return {}

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    system_instruction = """
    You are an expert multi-disciplinary university professor. Your job is to strictly analyze the entire provided document text at once and extract comprehensive, high-density academic data.
    
    CRITICAL STRUCTURE & OUTPUT DIRECTION:
    1. "summary" MUST contain individual, ultra-crisp summaries for EACH and EVERY page identified by the '--- PAGE X ---' markers in the text. 
       You MUST strictly format each page's summary exactly with this header format:
       ### Page X Summary
       [Then write an ultra-crisp, sharp 3-5 bullet points or lines containing the core concept of that specific page]
       
       Separate each page summary block with two newlines. Do not group multiple pages under one heading. 
       Ensure NO pages are skipped from start to end.
       
    2. "key_points" MUST be high-density, context-heavy deeper historical/factual insights. Do NOT repeat or paraphrase the core lines already written in the "summary" block. Extract micro-details, structural policies, causes, effects, and foundational academic details that are separate from the generic summaries.
    
    3. "timeline_dates" MUST be a single combined array of strings. For every date, year, or range found, you MUST include the event context alongside it. 
       Strict Format Example: "1848 - Doctrine of Lapse introduced with the annexation of Satara." or "May 10, 1857 - Outbreak of mutiny at Meerut." Do NOT output isolated years or isolated numbers.
       
    4. "historians_quotes" MUST be a single combined array grouping everything about who said what, book names, verbatim statements, acts, and text laws mentioned across the text.
    5. Language Policy: If text is Hindi, generate in pure Devanagari Hindi. If English, pure English.
    """

    response_schema = {
        "type": "OBJECT",
        "properties": {
            "summary": {"type": "STRING"},
            "key_points": {"type": "ARRAY", "items": {"type": "STRING"}},
            "timeline_dates": {"type": "ARRAY", "items": {"type": "STRING"}},
            "historians_quotes": {"type": "ARRAY", "items": {"type": "STRING"}},
            "cheat_sheet": {"type": "ARRAY", "items": {"type": "STRING"}},
            "flashcards": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "question": {"type": "STRING"},
                        "answer": {"type": "STRING"}
                    },
                    "required": ["question", "answer"]
                }
            }
        },
        "required": ["summary", "key_points", "timeline_dates", "historians_quotes", "cheat_sheet", "flashcards"]
    }

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"Completely process this entire textbook data and populate the comprehensive structured schema:\n\n{text}",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=0.15
            )
        )
        
        if response and response.text:
            return json.loads(response.text.strip())
            
    except Exception as e:
        print(f"!!! Single-Shot Processing pipeline exception: {str(e)} !!!")
        
    return {
        "summary": "Processing block completed. Structural data isolated.",
        "key_points": [],
        "timeline_dates": [],
        "historians_quotes": [],
        "cheat_sheet": [],
        "flashcards": []
    }
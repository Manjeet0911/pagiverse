import os
import pypdf
from PIL import Image
import pytesseract
import io
from google import genai
from google.genai import types
import json
import time
from typing import List, Dict, Any
from app.config import settings

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    """
    Extracts text page-by-page and returns a structured list containing 
    the raw text string and the corresponding exact page number tracker.
    """
    pages_data = []
    try:
        with open(file_path, "rb") as f:
            reader = pypdf.PdfReader(f)
            for page_num, page in enumerate(reader.pages):
                extracted_text = page.extract_text()
                if extracted_text and extracted_text.strip():
                    pages_data.append({
                        "page_num": page_num + 1,
                        "text": extracted_text.strip()
                    })
    except Exception as e:
        print(f"Extraction layer exception: {str(e)}")
    return pages_data

def generate_insights_from_ai(text: str) -> Dict[str, Any]:
    if not text.strip():
        return {}

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    system_instruction = """
    You are an expert multi-disciplinary university professor. Your job is to strictly analyze the entire provided document chunk text at once and extract comprehensive, high-density academic data.
    
    CRITICAL STRUCTURE & OUTPUT DIRECTION:
    1. "summary" MUST contain individual, ultra-crisp summaries for EACH and EVERY page identified by the '--- PAGE X ---' markers in the text. 
       You MUST strictly format each page's summary exactly with this header format:
       ### Page X Summary
       [Then write an ultra-crisp, sharp 3-5 bullet points or lines containing the core concept of that specific page]
       
       Separate each page summary block with two newlines. Do not group multiple pages under one heading. 
       Ensure NO marked pages inside this text block are skipped.
       
    2. "key_points" MUST be high-density, context-heavy deeper insights. Do NOT repeat or paraphrase the core lines already written in the "summary" block. Extract micro-details, structural policies, causes, and foundational academic details.
    
    3. "timeline_dates" MUST be an array of strings. For every date, year, or range found, include the event context alongside it. 
       Strict Format Example: "1848 - Doctrine of Lapse introduced with the annexation of Satara." Do NOT output isolated years.
       
    4. "historians_quotes" MUST be a single combined array grouping everything about who said what, book names, verbatim statements, acts, and text laws mentioned across the text.
    5. Language Policy: If text is Hindi (Devanagari script), generate entirely in pure Devanagari Hindi setup. If English, pure English.
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
            contents=f"Completely process this textbook data chunk and populate the comprehensive structured schema:\n\n{text}",
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
        "summary": "",
        "key_points": [],
        "timeline_dates": [],
        "historians_quotes": [],
        "cheat_sheet": [],
        "flashcards": []
    }
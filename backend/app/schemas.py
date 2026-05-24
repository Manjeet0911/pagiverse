from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str

class DocumentResponse(BaseModel):
    id: str
    filename: str
    status: str
    user_id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class DocumentAnalyticsResponse(BaseModel):
    summary: str
    key_points: List[str]
    timeline_dates: List[str]
    historians_quotes: List[str]
    cheat_sheet: List[str]
    flashcards: List[Dict[str, str]]
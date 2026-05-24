from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    status = Column(String, default="processing")
    user_id = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(String, unique=True, nullable=False)
    summary = Column(Text, nullable=True)
    key_points = Column(Text, nullable=True)
    timeline_dates = Column(Text, nullable=True)
    historians_quotes = Column(Text, nullable=True)
    cheat_sheet = Column(Text, nullable=True)
    flashcards = Column(Text, nullable=True)
from pydantic import BaseModel
from datetime import datetime
from app.models.argument import ArgumentSide
from typing import Optional


class ArgumentCreate(BaseModel):
    content: str
    side: ArgumentSide


class ArgumentResponse(BaseModel):
    id: int
    debate_id: int
    author_id: int
    content: str
    side: ArgumentSide
    is_ai_generated: bool
    vote_count: int
    created_at: datetime

    # Quality scores
    quality_score_logic: Optional[int] = None
    quality_score_evidence: Optional[int] = None
    quality_score_relevance: Optional[int] = None
    quality_score_persuasiveness: Optional[int] = None
    quality_score_overall: Optional[int] = None

    class Config:
        from_attributes = True
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

from app.models.debate import DebateStatus


class TagInDebate(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class DebateCreate(BaseModel):
    topic: str
    description: Optional[str] = None
    tag_ids: Optional[List[int]] = []


class DebateResponse(BaseModel):
    id: int
    topic: str
    description: Optional[str]
    status: DebateStatus
    creator_id: int
    created_at: datetime
    ai_pro_argument: Optional[str]
    ai_con_argument: Optional[str]
    pro_votes: int
    con_votes: int
    tags: List[TagInDebate] = []

    ai_summary: Optional[str] = None
    ai_winner: Optional[str] = None
    summary_generated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
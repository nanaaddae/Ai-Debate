from pydantic import BaseModel
from typing import Optional


class TagBase(BaseModel):
    name: str
    description: Optional[str] = None


class TagCreate(TagBase):
    pass


class Tag(TagBase):
    id: int
    slug: str

    class Config:
        from_attributes = True
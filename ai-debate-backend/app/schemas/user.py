from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: int


class UserProfile(BaseModel):
    id: int
    username: str
    role: UserRole
    created_at: datetime
    total_debates: int
    total_arguments: int
    total_votes_received: int
    reputation_score: int

    class Config:
        from_attributes = True


class UserActivity(BaseModel):
    debates_created: list
    arguments_posted: list
    recent_votes: list

    class Config:
        from_attributes = True
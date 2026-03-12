from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MODERATOR = "moderator"
    VERIFIED_USER = "verified_user"
    GUEST = "guest"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VERIFIED_USER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships - use strings to avoid circular imports
    debates = relationship("Debate", back_populates="creator")
    arguments = relationship("Argument", back_populates="author")
    votes = relationship("Vote", back_populates="user")
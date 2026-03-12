from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class ArgumentSide(str, enum.Enum):
    PRO = "pro"
    CON = "con"


class Argument(Base):
    __tablename__ = "arguments"

    id = Column(Integer, primary_key=True, index=True)
    debate_id = Column(Integer, ForeignKey("debates.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    side = Column(Enum(ArgumentSide), nullable=False)
    is_ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    vote_count = Column(Integer, default=0)

    # Quality scores (0-100)
    quality_score_logic = Column(Integer, default=None)
    quality_score_evidence = Column(Integer, default=None)
    quality_score_relevance = Column(Integer, default=None)
    quality_score_persuasiveness = Column(Integer, default=None)
    quality_score_overall = Column(Integer, default=None)

    # Relationships - use strings to avoid circular imports
    debate = relationship("Debate", back_populates="arguments")
    author = relationship("User", back_populates="arguments")
    votes = relationship("Vote", back_populates="argument", cascade="all, delete-orphan")


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    argument_id = Column(Integer, ForeignKey("arguments.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships - use strings to avoid circular imports
    user = relationship("User", back_populates="votes")
    argument = relationship("Argument", back_populates="votes")
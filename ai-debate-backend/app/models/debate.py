from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, UniqueConstraint, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class DebateStatus(str, enum.Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    LOCKED = "locked"


# Define the association table HERE (in the same file as Debate)
debate_tags = Table(
    'debate_tags',
    Base.metadata,
    Column('debate_id', Integer, ForeignKey('debates.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)


class Debate(Base):
    __tablename__ = "debates"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(500), nullable=False, index=True)
    description = Column(Text)
    status = Column(Enum(DebateStatus), default=DebateStatus.ACTIVE)
    creator_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ai_pro_argument = Column(Text)
    ai_con_argument = Column(Text)

    pro_votes = Column(Integer, default=0)
    con_votes = Column(Integer, default=0)

    # AI Summary (generated when debate is closed)
    ai_summary = Column(Text, default=None)
    ai_winner = Column(String(10), default=None)  # "pro", "con", or "tie"
    summary_generated_at = Column(DateTime, default=None)

    # Relationships
    creator = relationship("User", back_populates="debates")
    arguments = relationship("Argument", back_populates="debate", cascade="all, delete-orphan")
    debate_votes = relationship("DebateVote", back_populates="debate", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=debate_tags, back_populates="debates")


class DebateVote(Base):
    __tablename__ = "debate_votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    debate_id = Column(Integer, ForeignKey("debates.id"), nullable=False)
    side = Column(String(3), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'debate_id', name='unique_user_debate_vote'),
    )

    debate = relationship("Debate", back_populates="debate_votes")
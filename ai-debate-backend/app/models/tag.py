from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(200))

    # Relationships - use string reference and import debate_tags from debate model
    debates = relationship("Debate", secondary="debate_tags", back_populates="tags")
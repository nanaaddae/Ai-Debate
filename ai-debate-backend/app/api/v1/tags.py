from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.tag import Tag as TagSchema, TagCreate
from app.models.tag import Tag
from app.models.user import User
from app.api.deps import get_current_user
from app.core.permissions import allow_admin

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("/", response_model=List[TagSchema])
def get_tags(db: Session = Depends(get_db)):
    """Get all tags"""
    tags = db.query(Tag).order_by(Tag.name).all()
    return tags


@router.get("/{tag_id}", response_model=TagSchema)
def get_tag(tag_id: int, db: Session = Depends(get_db)):
    """Get a specific tag"""
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.get("/slug/{slug}", response_model=TagSchema)
def get_tag_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get tag by slug"""
    tag = db.query(Tag).filter(Tag.slug == slug).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.post("/", response_model=TagSchema, status_code=status.HTTP_201_CREATED)
def create_tag(
        tag: TagCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Create a new tag (admin only)"""
    allow_admin(current_user)

    # Create slug from name
    slug = tag.name.lower().replace(" ", "-").replace("&", "and")

    # Check if tag already exists
    existing = db.query(Tag).filter(Tag.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag already exists")

    db_tag = Tag(
        name=tag.name,
        slug=slug,
        description=tag.description
    )

    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)

    return db_tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
        tag_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Delete a tag (admin only)"""
    allow_admin(current_user)

    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    db.delete(tag)
    db.commit()

    return None
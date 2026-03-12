from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User, UserRole
from app.models.debate import Debate, DebateStatus
from app.schemas.user import User as UserSchema
from app.schemas.debate import DebateResponse
from app.api.deps import get_current_user
from app.core.permissions import allow_admin, allow_moderator

router = APIRouter(prefix="/admin", tags=["admin"])


# Debate Management
@router.get("/debates", response_model=List[DebateResponse])
def get_all_debates_admin(
        skip: int = 0,
        limit: int = 50,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Get all debates (admin/moderator only)"""
    allow_moderator(current_user)
    debates = db.query(Debate).offset(skip).limit(limit).all()
    return debates


@router.patch("/debates/{debate_id}/status")
def update_debate_status_admin(
        debate_id: int,
        new_status: DebateStatus,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Update debate status (moderator only)"""
    allow_moderator(current_user)

    debate = db.query(Debate).filter(Debate.id == debate_id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")

    debate.status = new_status
    db.commit()
    db.refresh(debate)

    return {"message": f"Debate status updated to {new_status}", "debate": debate}


@router.delete("/debates/{debate_id}")
def delete_debate_admin(
        debate_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Delete debate (moderator only)"""
    allow_moderator(current_user)

    debate = db.query(Debate).filter(Debate.id == debate_id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")

    db.delete(debate)
    db.commit()

    return {"message": "Debate deleted successfully"}


# User Management
@router.get("/users", response_model=List[UserSchema])
def get_all_users(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Get all users (admin only)"""
    allow_admin(current_user)
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.patch("/users/{user_id}/role")
def update_user_role(
        user_id: int,
        new_role: UserRole,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Update user role (admin only)"""
    allow_admin(current_user)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = new_role
    db.commit()
    db.refresh(user)

    return {"message": f"User role updated to {new_role}", "user": user}


@router.patch("/users/{user_id}/ban")
def toggle_user_ban(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Ban/unban user (admin only)"""
    allow_admin(current_user)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    status_text = "unbanned" if user.is_active else "banned"
    return {"message": f"User {status_text}", "user": user}


# Stats
@router.get("/stats")
def get_admin_stats(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Get platform statistics (admin/moderator only)"""
    allow_moderator(current_user)

    total_users = db.query(User).count()
    total_debates = db.query(Debate).count()
    active_debates = db.query(Debate).filter(Debate.status == DebateStatus.ACTIVE).count()

    return {
        "total_users": total_users,
        "total_debates": total_debates,
        "active_debates": active_debates,
        "users_by_role": {
            "admin": db.query(User).filter(User.role == UserRole.ADMIN).count(),
            "moderator": db.query(User).filter(User.role == UserRole.MODERATOR).count(),
            "verified_user": db.query(User).filter(User.role == UserRole.VERIFIED_USER).count(),
            "guest": db.query(User).filter(User.role == UserRole.GUEST).count(),
        }
    }
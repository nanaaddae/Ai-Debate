from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from app.database import get_db
from app.schemas.user import User as UserSchema, UserProfile
from app.models.user import User, UserRole
from app.models.debate import Debate, DebateVote
from app.models.argument import Argument, Vote
from app.api.deps import get_current_user
from app.core.permissions import allow_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserSchema])
def get_users(
        skip: int = 0,
        limit: int = 50,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Only admins can list all users
    allow_admin(current_user)

    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserSchema)
def get_user(
        user_id: int,
        db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.get("/{user_id}/profile")
def get_user_profile(
        user_id: int,
        db: Session = Depends(get_db)
):
    """Get detailed user profile with stats"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Count debates created
    total_debates = db.query(Debate).filter(Debate.creator_id == user_id).count()

    # Count arguments posted
    total_arguments = db.query(Argument).filter(Argument.author_id == user_id).count()

    # Count votes received on arguments
    total_votes_received = db.query(func.sum(Argument.vote_count)) \
                               .filter(Argument.author_id == user_id) \
                               .scalar() or 0

    # Calculate reputation (simple formula: votes * 10 + debates * 50 + arguments * 5)
    reputation_score = (total_votes_received * 10) + (total_debates * 50) + (total_arguments * 5)

    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "created_at": user.created_at,
        "total_debates": total_debates,
        "total_arguments": total_arguments,
        "total_votes_received": total_votes_received,
        "reputation_score": reputation_score
    }


@router.get("/{user_id}/debates")
def get_user_debates(
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        db: Session = Depends(get_db)
):
    """Get debates created by user"""
    debates = db.query(Debate) \
        .filter(Debate.creator_id == user_id) \
        .order_by(desc(Debate.created_at)) \
        .offset(skip) \
        .limit(limit) \
        .all()

    return debates


@router.get("/{user_id}/arguments")
def get_user_arguments(
        user_id: int,
        skip: int = 0,
        limit: int = 50,
        db: Session = Depends(get_db)
):
    """Get arguments posted by user"""
    arguments = db.query(Argument) \
        .filter(Argument.author_id == user_id) \
        .order_by(desc(Argument.created_at)) \
        .offset(skip) \
        .limit(limit) \
        .all()

    # Include debate info for each argument
    result = []
    for arg in arguments:
        debate = db.query(Debate).filter(Debate.id == arg.debate_id).first()
        result.append({
            "id": arg.id,
            "content": arg.content,
            "side": arg.side,
            "vote_count": arg.vote_count,
            "created_at": arg.created_at,
            "debate": {
                "id": debate.id,
                "topic": debate.topic
            }
        })

    return result


@router.get("/{user_id}/activity")
def get_user_activity(
        user_id: int,
        db: Session = Depends(get_db)
):
    """Get recent activity summary"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Recent debates (last 5)
    recent_debates = db.query(Debate) \
        .filter(Debate.creator_id == user_id) \
        .order_by(desc(Debate.created_at)) \
        .limit(5) \
        .all()

    # Recent arguments (last 10)
    recent_arguments = db.query(Argument) \
        .filter(Argument.author_id == user_id) \
        .order_by(desc(Argument.created_at)) \
        .limit(10) \
        .all()

    # Get debate info for arguments
    args_with_debates = []
    for arg in recent_arguments:
        debate = db.query(Debate).filter(Debate.id == arg.debate_id).first()
        args_with_debates.append({
            "id": arg.id,
            "content": arg.content[:100] + "..." if len(arg.content) > 100 else arg.content,
            "side": arg.side,
            "vote_count": arg.vote_count,
            "created_at": arg.created_at,
            "debate_topic": debate.topic if debate else "Unknown"
        })

    # Recent votes cast by user (debate votes)
    recent_debate_votes = db.query(DebateVote) \
        .filter(DebateVote.user_id == user_id) \
        .order_by(desc(DebateVote.created_at)) \
        .limit(10) \
        .all()

    votes_with_debates = []
    for vote in recent_debate_votes:
        debate = db.query(Debate).filter(Debate.id == vote.debate_id).first()
        votes_with_debates.append({
            "debate_id": vote.debate_id,
            "debate_topic": debate.topic if debate else "Unknown",
            "side": vote.side,
            "voted_at": vote.created_at
        })

    return {
        "recent_debates": [{
            "id": d.id,
            "topic": d.topic,
            "status": d.status,
            "pro_votes": d.pro_votes,
            "con_votes": d.con_votes,
            "created_at": d.created_at
        } for d in recent_debates],
        "recent_arguments": args_with_debates,
        "recent_votes": votes_with_debates
    }


@router.patch("/{user_id}/role")
def update_user_role(
        user_id: int,
        new_role: UserRole,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Only admins can change roles
    allow_admin(current_user)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = new_role
    db.commit()
    db.refresh(user)

    return {"message": f"User role updated to {new_role}", "user": user}


@router.patch("/{user_id}/status")
def toggle_user_status(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Only admins can ban/unban users
    allow_admin(current_user)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    status = "activated" if user.is_active else "deactivated"
    return {"message": f"User {status}", "user": user}
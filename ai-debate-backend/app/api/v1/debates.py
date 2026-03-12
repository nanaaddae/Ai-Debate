from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.schemas.debate import DebateCreate, DebateResponse
from app.models.debate import Debate, DebateStatus, DebateVote
from app.models.user import User
from app.api.deps import get_current_user
from app.services.ai_service import ai_service
from app.core.permissions import allow_verified, allow_moderator
from app.services.websocket_manager import ws_manager
from app.models.tag import Tag
from app.services.debate_summarizer import debate_summarizer
import json
from app.models.argument import Argument

router = APIRouter(prefix="/debates", tags=["debates"])


@router.post("/", response_model=DebateResponse, status_code=status.HTTP_201_CREATED)
async def create_debate(
        debate: DebateCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    allow_verified(current_user)

    try:
        ai_arguments = await ai_service.generate_debate_arguments(debate.topic)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI arguments: {str(e)}"
        )

    db_debate = Debate(
        topic=debate.topic,
        description=debate.description,
        creator_id=current_user.id,
        ai_pro_argument=ai_arguments["pro"],
        ai_con_argument=ai_arguments["con"]
    )

    # Add tags
    if debate.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(debate.tag_ids)).all()
        db_debate.tags = tags

    db.add(db_debate)
    db.commit()
    db.refresh(db_debate)

    # Emit WebSocket event for new debate
    await ws_manager.emit_new_debate({
        'id': db_debate.id,
        'topic': db_debate.topic,
        'description': db_debate.description,
        'status': db_debate.status.value,
        'created_at': db_debate.created_at.isoformat(),
        'pro_votes': db_debate.pro_votes,
        'con_votes': db_debate.con_votes,
        'tags': [{'id': t.id, 'name': t.name, 'slug': t.slug} for t in db_debate.tags]
    })

    return db_debate


@router.get("/", response_model=List[DebateResponse])
def get_debates(
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = Query(None, description="Search in topic and description"),
        status: Optional[DebateStatus] = Query(None, description="Filter by status"),
        tag: Optional[str] = Query(None, description="Filter by tag slug"),
        sort_by: Optional[str] = Query("newest", description="Sort by: newest, oldest, most_voted, controversial"),
        db: Session = Depends(get_db)
):
    query = db.query(Debate)

    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Debate.topic.ilike(search_term),
                Debate.description.ilike(search_term)
            )
        )

    # Status filter
    if status:
        query = query.filter(Debate.status == status)

    # Tag filter
    if tag:
        tag_obj = db.query(Tag).filter(Tag.slug == tag).first()
        if tag_obj:
            query = query.filter(Debate.tags.contains(tag_obj))

    # Sorting
    if sort_by == "newest":
        query = query.order_by(desc(Debate.created_at))
    elif sort_by == "oldest":
        query = query.order_by(asc(Debate.created_at))
    elif sort_by == "most_voted":
        query = query.order_by(desc(Debate.pro_votes + Debate.con_votes))
    elif sort_by == "controversial":
        query = query.order_by(
            desc(
                (Debate.pro_votes + Debate.con_votes) *
                (1 - abs(Debate.pro_votes - Debate.con_votes) / (Debate.pro_votes + Debate.con_votes + 1))
            )
        )
    else:
        query = query.order_by(desc(Debate.created_at))

    debates = query.offset(skip).limit(limit).all()

    return debates


@router.get("/{debate_id}", response_model=DebateResponse)
def get_debate(debate_id: int, db: Session = Depends(get_db)):
    debate = db.query(Debate).filter(Debate.id == debate_id).first()

    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")

    return debate

@router.patch("/{debate_id}/status")
def update_debate_status(
        debate_id: int,
        new_status: DebateStatus,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    allow_moderator(current_user)
    debate = db.query(Debate).filter(Debate.id == debate_id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    debate.status = new_status
    db.commit()
    db.refresh(debate)
    return {"message": f"Debate status updated to {new_status}"}


@router.delete("/{debate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_debate(
        debate_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    debate = db.query(Debate).filter(Debate.id == debate_id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    allow_moderator(current_user)
    db.delete(debate)
    db.commit()
    return None


@router.post("/{debate_id}/vote")
async def vote_on_debate(
        debate_id: int,
        side: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    debate = db.query(Debate).filter(Debate.id == debate_id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")

    if debate.status != DebateStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Cannot vote on inactive debate")

    if side not in ["pro", "con"]:
        raise HTTPException(status_code=400, detail="Side must be 'pro' or 'con'")

    existing_vote = db.query(DebateVote).filter(
        DebateVote.user_id == current_user.id,
        DebateVote.debate_id == debate_id
    ).first()

    if existing_vote:
        if existing_vote.side == side:
            if side == "pro":
                debate.pro_votes -= 1
            else:
                debate.con_votes -= 1
            db.delete(existing_vote)
            message = "Vote removed"
        else:
            if existing_vote.side == "pro":
                debate.pro_votes -= 1
                debate.con_votes += 1
            else:
                debate.con_votes -= 1
                debate.pro_votes += 1
            existing_vote.side = side
            message = f"Vote switched to {side}"
    else:
        new_vote = DebateVote(
            user_id=current_user.id,
            debate_id=debate_id,
            side=side
        )
        db.add(new_vote)
        if side == "pro":
            debate.pro_votes += 1
        else:
            debate.con_votes += 1
        message = f"Voted {side}"

    db.commit()
    db.refresh(debate)

    # Emit WebSocket event for vote update
    await ws_manager.emit_debate_update(debate_id, 'vote_update', {
        'debate_id': debate_id,
        'pro_votes': debate.pro_votes,
        'con_votes': debate.con_votes
    })

    return {
        "message": message,
        "pro_votes": debate.pro_votes,
        "con_votes": debate.con_votes
    }


@router.post("/{debate_id}/generate-summary")
async def generate_debate_summary(
        debate_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Generate AI summary for a debate (moderator/creator only)"""
    debate = db.query(Debate).filter(Debate.id == debate_id).first()

    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")

    # Only moderators/admins or debate creator can generate summary
    if current_user.role not in ["moderator", "admin"] and current_user.id != debate.creator_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get all arguments
    all_arguments = db.query(Argument).filter(Argument.debate_id == debate_id).all()

    user_pro_arguments = [
        {"content": arg.content, "vote_count": arg.vote_count}
        for arg in all_arguments
        if arg.side.value == "pro" and not arg.is_ai_generated
    ]

    user_con_arguments = [
        {"content": arg.content, "vote_count": arg.vote_count}
        for arg in all_arguments
        if arg.side.value == "con" and not arg.is_ai_generated
    ]

    # Generate summary
    try:
        summary_data = await debate_summarizer.generate_debate_summary(
            debate_topic=debate.topic,
            ai_pro_argument=debate.ai_pro_argument,
            ai_con_argument=debate.ai_con_argument,
            user_pro_arguments=user_pro_arguments,
            user_con_arguments=user_con_arguments,
            pro_votes=debate.pro_votes,
            con_votes=debate.con_votes
        )

        # Store full summary as JSON in ai_summary field
        debate.ai_summary = json.dumps(summary_data)
        debate.ai_winner = summary_data['winner']
        debate.summary_generated_at = datetime.utcnow()

        db.commit()
        db.refresh(debate)

        return {
            "message": "Summary generated successfully",
            "summary": summary_data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {str(e)}"
        )
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.argument import ArgumentCreate, ArgumentResponse
from app.models.argument import Argument, Vote
from app.models.debate import Debate, DebateStatus
from app.models.user import User
from app.api.deps import get_current_user
from app.core.permissions import allow_all_authenticated
from app.services.websocket_manager import ws_manager
from app.services.quality_scorer import quality_scorer  # Add this

router = APIRouter(prefix="/arguments", tags=["arguments"])


@router.post("/debates/{debate_id}/arguments", response_model=ArgumentResponse, status_code=status.HTTP_201_CREATED)
async def create_argument(
        debate_id: int,
        argument: ArgumentCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    debate = db.query(Debate).filter(Debate.id == debate_id).first()

    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")

    if debate.status != DebateStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Cannot add arguments to inactive debate")

    # Create argument first
    db_argument = Argument(
        debate_id=debate_id,
        author_id=current_user.id,
        content=argument.content,
        side=argument.side,
        is_ai_generated=False
    )

    db.add(db_argument)
    db.commit()
    db.refresh(db_argument)

    # Score the argument with AI (async, don't block)
    try:
        scores = await quality_scorer.score_argument(argument.content, debate.topic)

        # Update argument with scores
        db_argument.quality_score_logic = scores['logic']
        db_argument.quality_score_evidence = scores['evidence']
        db_argument.quality_score_relevance = scores['relevance']
        db_argument.quality_score_persuasiveness = scores['persuasiveness']
        db_argument.quality_score_overall = scores['overall']

        db.commit()
        db.refresh(db_argument)

        print(f"✅ Scored argument {db_argument.id}: Overall {scores['overall']}/100")
        print(f"   Explanation: {scores['explanation']}")

    except Exception as e:
        print(f"⚠️ Failed to score argument: {e}")
        # Don't fail the whole request if scoring fails

    # Emit WebSocket event for new argument
    await ws_manager.emit_debate_update(debate_id, 'new_argument', {
        'id': db_argument.id,
        'debate_id': db_argument.debate_id,
        'author_id': db_argument.author_id,
        'content': db_argument.content,
        'side': db_argument.side.value,
        'is_ai_generated': db_argument.is_ai_generated,
        'vote_count': db_argument.vote_count,
        'created_at': db_argument.created_at.isoformat(),
        'quality_score_overall': db_argument.quality_score_overall
    })

    return db_argument


# Rest of the file stays the same...
@router.get("/debates/{debate_id}/arguments", response_model=List[ArgumentResponse])
def get_debate_arguments(
        debate_id: int,
        skip: int = 0,
        limit: int = 50,
        db: Session = Depends(get_db)
):
    debate = db.query(Debate).filter(Debate.id == debate_id).first()

    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")

    arguments = db.query(Argument) \
        .filter(Argument.debate_id == debate_id) \
        .order_by(Argument.vote_count.desc(), Argument.created_at.desc()) \
        .offset(skip) \
        .limit(limit) \
        .all()

    return arguments


@router.get("/{argument_id}", response_model=ArgumentResponse)
def get_argument(argument_id: int, db: Session = Depends(get_db)):
    argument = db.query(Argument).filter(Argument.id == argument_id).first()

    if not argument:
        raise HTTPException(status_code=404, detail="Argument not found")

    return argument


@router.post("/{argument_id}/vote")
async def vote_on_argument(
        argument_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    argument = db.query(Argument).filter(Argument.id == argument_id).first()

    if not argument:
        raise HTTPException(status_code=404, detail="Argument not found")

    existing_vote = db.query(Vote).filter(
        Vote.user_id == current_user.id,
        Vote.argument_id == argument_id
    ).first()

    if existing_vote:
        db.delete(existing_vote)
        argument.vote_count -= 1
        message = "Vote removed"
    else:
        new_vote = Vote(
            user_id=current_user.id,
            argument_id=argument_id
        )
        db.add(new_vote)
        argument.vote_count += 1
        message = "Vote added"

    db.commit()
    db.refresh(argument)

    await ws_manager.emit_debate_update(argument.debate_id, 'argument_vote_update', {
        'argument_id': argument_id,
        'vote_count': argument.vote_count
    })

    return {
        "message": message,
        "vote_count": argument.vote_count
    }


@router.delete("/{argument_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_argument(
        argument_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    argument = db.query(Argument).filter(Argument.id == argument_id).first()

    if not argument:
        raise HTTPException(status_code=404, detail="Argument not found")

    if current_user.id != argument.author_id and current_user.role not in ["moderator", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this argument")

    db.delete(argument)
    db.commit()

    return None
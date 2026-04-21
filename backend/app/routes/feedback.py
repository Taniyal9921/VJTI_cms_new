from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.schemas.feedback import FeedbackCreate, FeedbackOut
from app.services import feedback_service

router = APIRouter()


@router.post("", response_model=FeedbackOut)
def post_feedback(
    payload: FeedbackCreate,
    user: CurrentUser,
    db: Session = Depends(get_db),
) -> FeedbackOut:
    fb = feedback_service.create_feedback(db, payload, user)
    return FeedbackOut.model_validate(fb)

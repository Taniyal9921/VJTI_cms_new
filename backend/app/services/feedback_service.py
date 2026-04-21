"""Feedback: one per complaint (UNIQUE). Raiser confirms resolution before CLOSED is allowed."""
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.complaint import Complaint, ComplaintStatus
from app.models.feedback import Feedback
from app.models.user import User, UserRole
from app.schemas.feedback import FeedbackCreate


def create_feedback(db: Session, data: FeedbackCreate, user: User) -> Feedback:
    if user.role not in (UserRole.STUDENT, UserRole.FACULTY):
        raise HTTPException(status_code=403, detail="Only students/faculty may submit feedback")

    c = db.get(Complaint, data.complaint_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if c.raised_by != user.user_id:
        raise HTTPException(status_code=403, detail="Only the raiser may submit feedback")
    if c.status != ComplaintStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Feedback allowed only after work is completed")

    existing = db.execute(select(Feedback).where(Feedback.complaint_id == data.complaint_id)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Feedback already submitted for this complaint")

    fb = Feedback(
        complaint_id=data.complaint_id,
        rating=data.rating,
        feedback_comment=data.feedback_comment,
        confirmed=data.confirmed,
        feedback_date=datetime.now(timezone.utc),
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb

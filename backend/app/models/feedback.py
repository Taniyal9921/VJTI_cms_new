"""ER: FEEDBACK → one row per complaint (complaint_id UNIQUE); gates CLOSED with confirmed=True."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.complaint import Complaint


class Feedback(Base):
    __tablename__ = "feedbacks"

    feedback_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complaint_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("complaints.complaint_id"), unique=True, nullable=False
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    feedback_comment: Mapped[str] = mapped_column(Text, nullable=False)
    confirmed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    feedback_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    complaint: Mapped["Complaint"] = relationship("Complaint", back_populates="feedback")

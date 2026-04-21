"""ER: STATUS_HISTORY → audit trail for complaint.status transitions."""
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.complaint import Complaint
    from app.models.user import User


class StatusHistory(Base):
    __tablename__ = "status_histories"

    history_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complaint_id: Mapped[int] = mapped_column(Integer, ForeignKey("complaints.complaint_id"), nullable=False)
    changed_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=False)
    old_status: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    new_status: Mapped[str] = mapped_column(String(64), nullable=False)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    complaint: Mapped["Complaint"] = relationship("Complaint", back_populates="status_history")
    user: Mapped["User"] = relationship("User")

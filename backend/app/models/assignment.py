"""ER: ASSIGNMENT → `assignments` (staff workload linked to one complaint)."""
import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.pg_enum import pg_enum

if TYPE_CHECKING:
    from app.models.complaint import Complaint
    from app.models.user import User


class AssignmentStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    DONE = "Done"
    CANCELLED = "Cancelled"


class Assignment(Base):
    __tablename__ = "assignments"

    assignment_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complaint_id: Mapped[int] = mapped_column(Integer, ForeignKey("complaints.complaint_id"), nullable=False)
    assigned_to: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=False)
    assigned_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=False)
    assigned_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completion_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    work_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assignment_status: Mapped[AssignmentStatus] = mapped_column(
        pg_enum(AssignmentStatus, name="assignment_status"), nullable=False
    )

    complaint: Mapped["Complaint"] = relationship("Complaint", back_populates="assignments")
    assignee: Mapped["User"] = relationship(
        "User", foreign_keys=[assigned_to], back_populates="assignments_as_assignee"
    )
    assigner: Mapped["User"] = relationship("User", foreign_keys=[assigned_by])

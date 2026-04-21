"""
ER: COMPLAINT → `complaints`.

Maps complaint_type to housekeeping vs maintenance flows in services:
- Housekeeping: approval_status pre-approved; HK_Manager assigns directly.
- Maintenance: approval_status Pending until HOD acts; Maint_Manager assigns only if Approved.

Lifecycle status (ComplaintStatus) mirrors: Submitted → Approved → Assigned → In Progress → Completed → Closed.
"""
import enum
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.pg_enum import pg_enum

if TYPE_CHECKING:
    from app.models.assignment import Assignment
    from app.models.complaint_attachment import ComplaintAttachment
    from app.models.department import Department
    from app.models.feedback import Feedback
    from app.models.location import Location
    from app.models.status_history import StatusHistory
    from app.models.user import User


class ComplaintType(str, enum.Enum):
    HOUSEKEEPING = "Housekeeping"
    MAINTENANCE = "Maintenance"


class Priority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    EMERGENCY = "Emergency"


class ComplaintStatus(str, enum.Enum):
    SUBMITTED = "Submitted"
    APPROVED = "Approved"
    ASSIGNED = "Assigned"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CLOSED = "Closed"


class ApprovalStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class Complaint(Base):
    __tablename__ = "complaints"

    complaint_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    complaint_type: Mapped[ComplaintType] = mapped_column(
        pg_enum(ComplaintType, name="complaint_type"), nullable=False
    )
    priority: Mapped[Priority] = mapped_column(pg_enum(Priority, name="priority"), nullable=False)
    status: Mapped[ComplaintStatus] = mapped_column(
        pg_enum(ComplaintStatus, name="complaint_status"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    location_id: Mapped[int] = mapped_column(Integer, ForeignKey("locations.location_id"), nullable=False)
    raised_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=False)
    department_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("departments.department_id"), nullable=False
    )
    approval_status: Mapped[ApprovalStatus] = mapped_column(
        pg_enum(ApprovalStatus, name="approval_status"), nullable=False
    )
    approved_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.user_id"), nullable=True
    )
    approval_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    location: Mapped["Location"] = relationship("Location", back_populates="complaints")
    raiser: Mapped["User"] = relationship("User", foreign_keys=[raised_by])
    department: Mapped["Department"] = relationship("Department")
    approver: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by])

    assignments: Mapped[List["Assignment"]] = relationship(
        "Assignment",
        back_populates="complaint",
    )
    status_history: Mapped[List["StatusHistory"]] = relationship(
        "StatusHistory",
        back_populates="complaint",
    )
    feedback: Mapped[Optional["Feedback"]] = relationship(
        "Feedback",
        back_populates="complaint",
        uselist=False,
    )
    attachments: Mapped[List["ComplaintAttachment"]] = relationship(
        "ComplaintAttachment",
        back_populates="complaint",
    )

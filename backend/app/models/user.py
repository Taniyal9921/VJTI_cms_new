"""
ER: USER → table `users`.

Roles drive RBAC in `app.core.deps` and services:
- Student/Faculty: raise complaints, feedback
- HOD: approve/reject maintenance for their department (department.hod_id)
- HK_Manager: housekeeping assignments (no prior approval)
- Maint_Manager: maintenance assignments after HOD approval
- Staff: execute assignments, status updates on assigned work
"""
import enum
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.pg_enum import pg_enum

if TYPE_CHECKING:
    from app.models.assignment import Assignment
    from app.models.complaint import Complaint
    from app.models.department import Department


class UserRole(str, enum.Enum):
    STUDENT = "Student"
    FACULTY = "Faculty"
    HOD = "HOD"
    HK_MANAGER = "HK_Manager"
    MAINT_MANAGER = "Maint_Manager"
    STAFF = "Staff"
    ADMIN = "Admin"


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(pg_enum(UserRole, name="user_role"), nullable=False)
    department_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("departments.department_id"), nullable=True
    )
    designation: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    student_reg_no: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    year_of_study: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active")

    department: Mapped[Optional["Department"]] = relationship(
        "Department",
        foreign_keys=[department_id],
        back_populates="members",
    )
    complaints_raised: Mapped[List["Complaint"]] = relationship(
        "Complaint",
        foreign_keys="Complaint.raised_by",
        back_populates="raiser",
    )
    assignments_as_assignee: Mapped[List["Assignment"]] = relationship(
        "Assignment",
        foreign_keys="Assignment.assigned_to",
        back_populates="assignee",
    )

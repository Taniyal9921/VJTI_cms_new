"""
ER: DEPARTMENT → `departments`.

hod_id → USER: circular FK with users.department_id resolved via use_alter so
create_all can run in one pass (PostgreSQL).
"""
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class Department(Base):
    __tablename__ = "departments"

    department_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    department_name: Mapped[str] = mapped_column(String(255), nullable=False)
    building_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    hod_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.user_id", name="fk_departments_hod_id", use_alter=True),
        nullable=True,
    )
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    hod: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[hod_id],
        backref="hod_of_departments",
    )
    members: Mapped[List["User"]] = relationship(
        "User",
        foreign_keys="User.department_id",
        back_populates="department",
    )

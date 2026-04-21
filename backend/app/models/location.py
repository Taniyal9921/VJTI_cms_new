"""ER: LOCATION → `locations` (building/floor/room scoped to a department)."""
from typing import TYPE_CHECKING, List

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.complaint import Complaint
    from app.models.department import Department


class Location(Base):
    __tablename__ = "locations"

    location_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    building_name: Mapped[str] = mapped_column(String(128), nullable=False)
    floor_number: Mapped[str] = mapped_column(String(32), nullable=False)
    room_number: Mapped[str] = mapped_column(String(64), nullable=False)
    department_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("departments.department_id"), nullable=False
    )
    location_type: Mapped[str] = mapped_column(String(64), nullable=False)

    department: Mapped["Department"] = relationship("Department")
    complaints: Mapped[List["Complaint"]] = relationship("Complaint", back_populates="location")

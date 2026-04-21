"""
ER: COMPLAINT_ATTACHMENT → `complaint_attachments`.

Stores files (images/videos) uploaded with complaints.
"""
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.complaint import Complaint


class ComplaintAttachment(Base):
    __tablename__ = "complaint_attachments"

    attachment_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complaint_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("complaints.complaint_id"), nullable=False
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_type: Mapped[str] = mapped_column(String(32), nullable=False)  # e.g., "image", "video"
    mime_type: Mapped[str] = mapped_column(String(64), nullable=False)  # e.g., "image/jpeg"
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)  # size in bytes
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    complaint: Mapped["Complaint"] = relationship("Complaint", back_populates="attachments")

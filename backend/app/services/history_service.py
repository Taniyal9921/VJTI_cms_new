"""Append-only STATUS_HISTORY rows for timeline UI and audit."""
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.status_history import StatusHistory


def append_status_history(
    db: Session,
    *,
    complaint_id: int,
    changed_by: int,
    old_status: str | None,
    new_status: str,
    remarks: str | None = None,
) -> None:
    db.add(
        StatusHistory(
            complaint_id=complaint_id,
            changed_by=changed_by,
            old_status=old_status,
            new_status=new_status,
            remarks=remarks,
            changed_at=datetime.now(timezone.utc),
        )
    )


def touch_complaint_timestamp(db: Session, complaint) -> None:
    from datetime import datetime, timezone

    complaint.updated_at = datetime.now(timezone.utc)

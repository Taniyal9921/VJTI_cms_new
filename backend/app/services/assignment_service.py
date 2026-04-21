"""Assignment workflow: managers create; staff complete — ties into complaint.status transitions."""
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.assignment import Assignment, AssignmentStatus
from app.models.complaint import ApprovalStatus, Complaint, ComplaintStatus, ComplaintType
from app.models.user import User, UserRole
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate
from app.services.complaint_service import active_open_assignment
from app.services.history_service import append_status_history, touch_complaint_timestamp


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_assignment(db: Session, data: AssignmentCreate, manager: User) -> Assignment:
    c = db.get(Complaint, data.complaint_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if c.status == ComplaintStatus.CLOSED:
        raise HTTPException(status_code=400, detail="Complaint is closed")

    if c.complaint_type == ComplaintType.HOUSEKEEPING:
        if manager.role != UserRole.HK_MANAGER:
            raise HTTPException(status_code=403, detail="Only HK_Manager may assign housekeeping")
    else:
        if manager.role != UserRole.MAINT_MANAGER:
            raise HTTPException(status_code=403, detail="Only Maint_Manager may assign maintenance")
        if c.approval_status != ApprovalStatus.APPROVED:
            raise HTTPException(status_code=400, detail="Maintenance must be HOD-approved before assignment")

    if c.status not in (
        ComplaintStatus.SUBMITTED,
        ComplaintStatus.APPROVED,
        ComplaintStatus.ASSIGNED,
        ComplaintStatus.IN_PROGRESS,
    ):
        raise HTTPException(status_code=400, detail="Complaint is not in a state that allows assignment")

    if active_open_assignment(db, c.complaint_id) is not None:
        raise HTTPException(status_code=400, detail="An open assignment already exists; complete or cancel it first")

    assignee = db.get(User, data.assigned_to)
    if assignee is None or assignee.role != UserRole.STAFF:
        raise HTTPException(status_code=400, detail="assigned_to must be a Staff user")

    now = _now()
    a = Assignment(
        complaint_id=c.complaint_id,
        assigned_to=data.assigned_to,
        assigned_by=manager.user_id,
        assigned_date=now,
        completion_date=None,
        work_notes=data.work_notes,
        assignment_status=AssignmentStatus.PENDING,
    )
    db.add(a)

    old_cs = c.status.value
    if c.status in (ComplaintStatus.SUBMITTED, ComplaintStatus.APPROVED):
        c.status = ComplaintStatus.ASSIGNED
        touch_complaint_timestamp(db, c)
        append_status_history(
            db,
            complaint_id=c.complaint_id,
            changed_by=manager.user_id,
            old_status=old_cs,
            new_status=c.status.value,
            remarks="Staff assigned",
        )

    db.commit()
    db.refresh(a)
    return a


def update_assignment(db: Session, assignment_id: int, data: AssignmentUpdate, actor: User) -> Assignment:
    a = db.get(Assignment, assignment_id)
    if a is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    c = db.get(Complaint, a.complaint_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if actor.role == UserRole.STAFF:
        if a.assigned_to != actor.user_id:
            raise HTTPException(status_code=403, detail="Not your assignment")
    elif actor.role in (UserRole.HK_MANAGER, UserRole.MAINT_MANAGER):
        if c.complaint_type == ComplaintType.HOUSEKEEPING and actor.role != UserRole.HK_MANAGER:
            raise HTTPException(status_code=403, detail="Wrong manager role for this complaint type")
        if c.complaint_type == ComplaintType.MAINTENANCE and actor.role != UserRole.MAINT_MANAGER:
            raise HTTPException(status_code=403, detail="Wrong manager role for this complaint type")
    else:
        raise HTTPException(status_code=403, detail="Not allowed to update assignments")

    if data.work_notes is not None:
        a.work_notes = data.work_notes
    if data.assignment_status is not None:
        a.assignment_status = data.assignment_status
        if data.assignment_status == AssignmentStatus.IN_PROGRESS and c.status == ComplaintStatus.ASSIGNED:
            old = c.status.value
            c.status = ComplaintStatus.IN_PROGRESS
            touch_complaint_timestamp(db, c)
            append_status_history(
                db,
                complaint_id=c.complaint_id,
                changed_by=actor.user_id,
                old_status=old,
                new_status=c.status.value,
                remarks="Work started",
            )
        if data.assignment_status == AssignmentStatus.DONE:
            a.completion_date = data.completion_date or _now()
            old = c.status.value
            if c.status != ComplaintStatus.CLOSED:
                c.status = ComplaintStatus.COMPLETED
            touch_complaint_timestamp(db, c)
            append_status_history(
                db,
                complaint_id=c.complaint_id,
                changed_by=actor.user_id,
                old_status=old,
                new_status=c.status.value,
                remarks="Assignment marked Done — awaiting feedback to close",
            )
    elif data.completion_date is not None:
        a.completion_date = data.completion_date

    db.commit()
    db.refresh(a)
    return a

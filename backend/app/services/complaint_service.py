"""
Complaint domain rules (maps ER + business text to code).

Housekeeping: approval_status is Approved at creation (HOD step skipped); HK_Manager may assign immediately.
Maintenance: starts Submitted + Pending; HOD approve → Approved; reject → Closed.
Closing: blocked unless latest assignment is Done AND feedback.confirmed is True.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, Sequence, Tuple

from fastapi import HTTPException, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.assignment import Assignment, AssignmentStatus
from app.models.complaint import ApprovalStatus, Complaint, ComplaintStatus, ComplaintType
from app.models.department import Department
from app.models.feedback import Feedback
from app.models.location import Location
from app.models.status_history import StatusHistory
from app.models.user import User, UserRole
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, StatusUpdateRequest
from app.services.history_service import append_status_history, touch_complaint_timestamp


def _now() -> datetime:
    return datetime.now(timezone.utc)


def is_hod_of_department(db: Session, user: User, department_id: int) -> bool:
    if user.role != UserRole.HOD:
        return False
    dept = db.get(Department, department_id)
    return bool(dept and dept.hod_id == user.user_id)


def latest_assignment(db: Session, complaint_id: int) -> Optional[Assignment]:
    stmt = (
        select(Assignment)
        .where(Assignment.complaint_id == complaint_id)
        .order_by(Assignment.assignment_id.desc())
        .limit(1)
    )
    return db.execute(stmt).scalar_one_or_none()


def active_open_assignment(db: Session, complaint_id: int) -> Optional[Assignment]:
    stmt = select(Assignment).where(
        Assignment.complaint_id == complaint_id,
        Assignment.assignment_status.in_((AssignmentStatus.PENDING, AssignmentStatus.IN_PROGRESS)),
    )
    return db.execute(stmt).scalars().first()


def _get_or_create_location_for_complaint(db: Session, data: ComplaintCreate) -> Location:
    dept = db.get(Department, data.department_id)
    if dept is None:
        raise HTTPException(status_code=400, detail="Invalid department_id")

    building = data.building_name.strip()
    floor = data.floor_number.strip()
    detail = (data.location_detail or "").strip()
    room = detail if detail else "—"

    stmt = select(Location).where(
        Location.department_id == data.department_id,
        Location.building_name == building,
        Location.floor_number == floor,
        Location.room_number == room,
    )
    loc = db.execute(stmt).scalar_one_or_none()
    if loc is not None:
        return loc

    loc = Location(
        building_name=building,
        floor_number=floor,
        room_number=room,
        department_id=data.department_id,
        location_type="User specified",
    )
    db.add(loc)
    db.flush()
    return loc


def create_complaint(db: Session, data: ComplaintCreate, raiser: User) -> Complaint:
    if raiser.role not in (UserRole.STUDENT, UserRole.FACULTY):
        raise HTTPException(status_code=403, detail="Only students and faculty may raise complaints")

    loc = _get_or_create_location_for_complaint(db, data)

    now = _now()
    if data.complaint_type == ComplaintType.HOUSEKEEPING:
        approval = ApprovalStatus.APPROVED
        cstatus = ComplaintStatus.SUBMITTED
        approval_date = now  # HOD step skipped; timestamp documents auto-approval path
    else:
        approval = ApprovalStatus.PENDING
        cstatus = ComplaintStatus.SUBMITTED
        approval_date = None

    c = Complaint(
        title=data.title,
        description=data.description,
        complaint_type=data.complaint_type,
        priority=data.priority,
        status=cstatus,
        created_at=now,
        updated_at=now,
        location_id=loc.location_id,
        raised_by=raiser.user_id,
        department_id=data.department_id,
        approval_status=approval,
        approved_by=None,
        approval_date=approval_date,
    )
    db.add(c)
    db.flush()
    append_status_history(
        db,
        complaint_id=c.complaint_id,
        changed_by=raiser.user_id,
        old_status=None,
        new_status=cstatus.value,
        remarks="Complaint created",
    )
    db.commit()
    stmt = (
        select(Complaint)
        .where(Complaint.complaint_id == c.complaint_id)
        .options(selectinload(Complaint.location), selectinload(Complaint.attachments))
    )
    return db.execute(stmt).scalar_one()


def list_complaints(
    db: Session,
    *,
    user: User,
    skip: int = 0,
    limit: int = 20,
    status_filter: Optional[ComplaintStatus] = None,
    type_filter: Optional[ComplaintType] = None,
    department_id: Optional[int] = None,
    q: Optional[str] = None,
) -> Tuple[Sequence[Complaint], int]:
    stmt = select(Complaint)
    count_stmt = select(func.count()).select_from(Complaint)

    if user.role in (UserRole.STUDENT, UserRole.FACULTY):
        stmt = stmt.where(Complaint.raised_by == user.user_id)
        count_stmt = count_stmt.where(Complaint.raised_by == user.user_id)
    elif user.role == UserRole.HOD:
        stmt = stmt.where(Complaint.department_id == user.department_id)
        count_stmt = count_stmt.where(Complaint.department_id == user.department_id)
    elif user.role == UserRole.STAFF:
        sub = select(Assignment.complaint_id).where(Assignment.assigned_to == user.user_id)
        stmt = stmt.where(Complaint.complaint_id.in_(sub))
        count_stmt = count_stmt.where(Complaint.complaint_id.in_(sub))
    # HK_Manager / Maint_Manager: see all (operational oversight)

    if status_filter is not None:
        stmt = stmt.where(Complaint.status == status_filter)
        count_stmt = count_stmt.where(Complaint.status == status_filter)
    if type_filter is not None:
        stmt = stmt.where(Complaint.complaint_type == type_filter)
        count_stmt = count_stmt.where(Complaint.complaint_type == type_filter)
    if department_id is not None:
        stmt = stmt.where(Complaint.department_id == department_id)
        count_stmt = count_stmt.where(Complaint.department_id == department_id)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Complaint.title.ilike(like), Complaint.description.ilike(like)))
        count_stmt = count_stmt.where(or_(Complaint.title.ilike(like), Complaint.description.ilike(like)))

    total = db.execute(count_stmt).scalar_one()
    stmt = (
        stmt.order_by(Complaint.created_at.desc())
        .offset(skip)
        .limit(limit)
        .options(selectinload(Complaint.location), selectinload(Complaint.attachments))
    )
    rows = db.execute(stmt).scalars().all()
    return rows, int(total)


def get_complaint_detail(db: Session, complaint_id: int, user: User) -> Complaint:
    stmt = (
        select(Complaint)
        .where(Complaint.complaint_id == complaint_id)
        .options(
            selectinload(Complaint.location),
            selectinload(Complaint.attachments),
            selectinload(Complaint.assignments),
            selectinload(Complaint.status_history),
            selectinload(Complaint.feedback),
        )
    )
    c = db.execute(stmt).scalar_one_or_none()
    if c is None:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if user.role in (UserRole.STUDENT, UserRole.FACULTY) and c.raised_by != user.user_id:
        raise HTTPException(status_code=403, detail="Not allowed to view this complaint")
    if user.role == UserRole.HOD and c.department_id != user.department_id:
        raise HTTPException(status_code=403, detail="Not allowed to view this complaint")
    if user.role == UserRole.STAFF:
        aid = (
            db.execute(
                select(Assignment.assignment_id).where(
                    Assignment.complaint_id == complaint_id,
                    Assignment.assigned_to == user.user_id,
                )
            ).first()
        )
        if aid is None:
            raise HTTPException(status_code=403, detail="Not allowed to view this complaint")

    return c


def update_complaint(db: Session, complaint_id: int, data: ComplaintUpdate, user: User) -> Complaint:
    c = db.get(Complaint, complaint_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if c.raised_by != user.user_id:
        raise HTTPException(status_code=403, detail="Only the raiser may update")
    if c.status not in (ComplaintStatus.SUBMITTED, ComplaintStatus.APPROVED):
        raise HTTPException(status_code=400, detail="Complaint can no longer be edited")
    if active_open_assignment(db, complaint_id) is not None:
        raise HTTPException(status_code=400, detail="Cannot edit after assignment is active")

    if data.title is not None:
        c.title = data.title
    if data.description is not None:
        c.description = data.description
    if data.priority is not None:
        c.priority = data.priority
    touch_complaint_timestamp(db, c)
    db.commit()
    db.refresh(c)
    return c


def delete_complaint(db: Session, complaint_id: int, user: User) -> None:
    c = db.get(Complaint, complaint_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if c.raised_by != user.user_id:
        raise HTTPException(status_code=403, detail="Only the raiser may delete")
    if c.status not in (ComplaintStatus.SUBMITTED, ComplaintStatus.APPROVED):
        raise HTTPException(status_code=400, detail="Complaint cannot be deleted in current state")
    if c.complaint_type == ComplaintType.MAINTENANCE and c.approval_status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail="Cannot delete after approval flow started")
    any_a = db.execute(
        select(Assignment.assignment_id).where(Assignment.complaint_id == complaint_id).limit(1)
    ).first()
    if any_a:
        raise HTTPException(status_code=400, detail="Cannot delete after assignment exists")

    db.execute(delete(StatusHistory).where(StatusHistory.complaint_id == complaint_id))
    db.delete(c)
    db.commit()


def approve_complaint(db: Session, complaint_id: int, hod: User, remarks: Optional[str]) -> Complaint:
    c = db.get(Complaint, complaint_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if c.complaint_type != ComplaintType.MAINTENANCE:
        raise HTTPException(status_code=400, detail="Only maintenance complaints require HOD approval")
    if not is_hod_of_department(db, hod, c.department_id):
        raise HTTPException(status_code=403, detail="Only the department HOD may approve")
    if c.approval_status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail="Complaint is not pending approval")

    old = c.status.value
    c.approval_status = ApprovalStatus.APPROVED
    c.approved_by = hod.user_id
    c.approval_date = _now()
    c.status = ComplaintStatus.APPROVED
    touch_complaint_timestamp(db, c)
    append_status_history(
        db,
        complaint_id=c.complaint_id,
        changed_by=hod.user_id,
        old_status=old,
        new_status=c.status.value,
        remarks=remarks or "HOD approved",
    )
    db.commit()
    db.refresh(c)
    return c


def reject_complaint(db: Session, complaint_id: int, hod: User, remarks: Optional[str]) -> Complaint:
    c = db.get(Complaint, complaint_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if c.complaint_type != ComplaintType.MAINTENANCE:
        raise HTTPException(status_code=400, detail="Only maintenance complaints use HOD rejection")
    if not is_hod_of_department(db, hod, c.department_id):
        raise HTTPException(status_code=403, detail="Only the department HOD may reject")
    if c.approval_status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail="Complaint is not pending approval")

    old = c.status.value
    c.approval_status = ApprovalStatus.REJECTED
    c.approved_by = hod.user_id
    c.approval_date = _now()
    c.status = ComplaintStatus.CLOSED
    c.closed_at = _now()
    touch_complaint_timestamp(db, c)
    append_status_history(
        db,
        complaint_id=c.complaint_id,
        changed_by=hod.user_id,
        old_status=old,
        new_status=c.status.value,
        remarks=remarks or "HOD rejected — complaint closed",
    )
    db.commit()
    db.refresh(c)
    return c


def apply_status_update(db: Session, complaint_id: int, body: StatusUpdateRequest, actor: User) -> Complaint:
    c = db.get(Complaint, complaint_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Complaint not found")

    new_s = body.new_status
    old_s = c.status

    if new_s == ComplaintStatus.CLOSED:
        fb = db.execute(select(Feedback).where(Feedback.complaint_id == complaint_id)).scalar_one_or_none()
        la = latest_assignment(db, complaint_id)
        if la is None or la.assignment_status != AssignmentStatus.DONE:
            raise HTTPException(
                status_code=400,
                detail="Cannot close: assignment must be Done",
            )
        if fb is None or not fb.confirmed:
            raise HTTPException(
                status_code=400,
                detail="Cannot close: feedback must exist with confirmed=true",
            )
        if actor.user_id != c.raised_by and actor.role not in (
            UserRole.HK_MANAGER,
            UserRole.MAINT_MANAGER,
        ):
            raise HTTPException(status_code=403, detail="Only raiser or managers may close after rules met")

    elif new_s == ComplaintStatus.COMPLETED:
        la = latest_assignment(db, complaint_id)
        if la is None or la.assignment_status != AssignmentStatus.DONE:
            raise HTTPException(status_code=400, detail="Set assignment to Done before marking Completed")
        if actor.role not in (
            UserRole.STAFF,
            UserRole.HK_MANAGER,
            UserRole.MAINT_MANAGER,
        ) and actor.user_id != c.raised_by:
            raise HTTPException(status_code=403, detail="Not allowed")

    elif new_s == ComplaintStatus.IN_PROGRESS:
        if actor.role != UserRole.STAFF:
            raise HTTPException(status_code=403, detail="Staff updates progress via assignment or this endpoint as staff")
        la = latest_assignment(db, complaint_id)
        if la is None or la.assigned_to != actor.user_id:
            raise HTTPException(status_code=403, detail="Not assigned to you")
        if la.assignment_status not in (AssignmentStatus.PENDING, AssignmentStatus.IN_PROGRESS):
            raise HTTPException(status_code=400, detail="Invalid assignment state")

    elif new_s == ComplaintStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Use HOD approve endpoint for maintenance")

    elif new_s == ComplaintStatus.ASSIGNED:
        raise HTTPException(status_code=400, detail="Assignment creation sets Assigned state")

    elif new_s == ComplaintStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Invalid transition")

    if new_s == old_s:
        return c

    c.status = new_s
    if new_s == ComplaintStatus.CLOSED:
        c.closed_at = _now()
    touch_complaint_timestamp(db, c)
    append_status_history(
        db,
        complaint_id=c.complaint_id,
        changed_by=actor.user_id,
        old_status=old_s.value,
        new_status=new_s.value,
        remarks=body.remarks,
    )
    db.commit()
    db.refresh(c)
    return c

from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Response, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.deps import CurrentUser, require_roles
from app.db.session import get_db
from app.models.complaint import Complaint, ComplaintStatus, ComplaintType, Priority
from app.models.complaint_attachment import ComplaintAttachment
from app.models.user import User, UserRole
from app.schemas.complaint import (
    ApproveRejectBody,
    AssignmentBrief,
    ComplaintCreate,
    ComplaintDetail,
    ComplaintOut,
    ComplaintUpdate,
    FeedbackBrief,
    StatusHistoryOut,
    StatusUpdateRequest,
)
from app.services import complaint_service
from app.services.file_service import get_file_type, save_complaint_file

router = APIRouter()


def _sort_detail(c) -> ComplaintDetail:
    assigns = sorted(c.assignments, key=lambda a: a.assigned_date, reverse=True)
    hist = sorted(c.status_history, key=lambda h: h.changed_at)
    base = ComplaintOut.model_validate(c)
    return ComplaintDetail(
        **base.model_dump(),
        assignments=[AssignmentBrief.model_validate(a) for a in assigns],
        status_history=[StatusHistoryOut.model_validate(h) for h in hist],
        feedback=FeedbackBrief.model_validate(c.feedback) if c.feedback else None,
    )


@router.post("", response_model=ComplaintOut)
async def create_complaint(
    user: CurrentUser,
    db: Session = Depends(get_db),
    title: str = Form(...),
    description: str = Form(...),
    complaint_type: str = Form(...),
    priority: str = Form(...),
    department_id: int = Form(...),
    building_name: str = Form(...),
    floor_number: str = Form(...),
    location_detail: str = Form(""),
    files: Optional[List[UploadFile]] = File(None),
) -> ComplaintOut:
    try:
        ct = ComplaintType(complaint_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid complaint_type") from e
    try:
        pr = Priority(priority)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid priority") from e

    payload = ComplaintCreate(
        title=title,
        description=description,
        complaint_type=ct,
        priority=pr,
        department_id=department_id,
        building_name=building_name,
        floor_number=floor_number,
        location_detail=location_detail,
    )

    c = complaint_service.create_complaint(db, payload, user)

    now = datetime.now(timezone.utc)
    for file in files or []:
        if not file.filename:
            continue
        try:
            file_path, mime_type, file_size = await save_complaint_file(c.complaint_id, file)
            db.add(
                ComplaintAttachment(
                    complaint_id=c.complaint_id,
                    file_name=file.filename,
                    file_path=file_path,
                    file_type=get_file_type(mime_type),
                    mime_type=mime_type,
                    file_size=file_size,
                    uploaded_at=now,
                )
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e

    db.commit()
    stmt = (
        select(Complaint)
        .where(Complaint.complaint_id == c.complaint_id)
        .options(selectinload(Complaint.location), selectinload(Complaint.attachments))
    )
    c_out = db.execute(stmt).scalar_one()
    return ComplaintOut.model_validate(c_out)


@router.get("", response_model=List[ComplaintOut])
def list_complaints(
    response: Response,
    user: CurrentUser,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[ComplaintStatus] = None,
    complaint_type: Optional[ComplaintType] = None,
    department_id: Optional[int] = None,
    q: Optional[str] = None,
) -> List[ComplaintOut]:
    rows, total = complaint_service.list_complaints(
        db,
        user=user,
        skip=skip,
        limit=limit,
        status_filter=status,
        type_filter=complaint_type,
        department_id=department_id,
        q=q,
    )
    response.headers["X-Total-Count"] = str(total)
    return [ComplaintOut.model_validate(c) for c in rows]


@router.get("/{complaint_id}", response_model=ComplaintDetail)
def get_complaint(
    complaint_id: int,
    user: CurrentUser,
    db: Session = Depends(get_db),
) -> ComplaintDetail:
    c = complaint_service.get_complaint_detail(db, complaint_id, user)
    return _sort_detail(c)


@router.patch("/{complaint_id}", response_model=ComplaintOut)
def patch_complaint(
    complaint_id: int,
    payload: ComplaintUpdate,
    user: CurrentUser,
    db: Session = Depends(get_db),
) -> ComplaintOut:
    c = complaint_service.update_complaint(db, complaint_id, payload, user)
    stmt = (
        select(Complaint)
        .where(Complaint.complaint_id == c.complaint_id)
        .options(selectinload(Complaint.location), selectinload(Complaint.attachments))
    )
    c2 = db.execute(stmt).scalar_one()
    return ComplaintOut.model_validate(c2)


@router.delete("/{complaint_id}", status_code=204)
def remove_complaint(
    complaint_id: int,
    user: CurrentUser,
    db: Session = Depends(get_db),
) -> None:
    complaint_service.delete_complaint(db, complaint_id, user)


@router.post("/{complaint_id}/approve", response_model=ComplaintOut)
def approve(
    complaint_id: int,
    body: ApproveRejectBody,
    user: Annotated[User, Depends(require_roles(UserRole.HOD))],
    db: Session = Depends(get_db),
) -> ComplaintOut:
    c = complaint_service.approve_complaint(db, complaint_id, user, body.remarks)
    return ComplaintOut.model_validate(c)


@router.post("/{complaint_id}/reject", response_model=ComplaintOut)
def reject(
    complaint_id: int,
    body: ApproveRejectBody,
    user: Annotated[User, Depends(require_roles(UserRole.HOD))],
    db: Session = Depends(get_db),
) -> ComplaintOut:
    c = complaint_service.reject_complaint(db, complaint_id, user, body.remarks)
    return ComplaintOut.model_validate(c)


@router.post("/{complaint_id}/status-update", response_model=ComplaintOut)
def status_update(
    complaint_id: int,
    body: StatusUpdateRequest,
    user: CurrentUser,
    db: Session = Depends(get_db),
) -> ComplaintOut:
    c = complaint_service.apply_status_update(db, complaint_id, body, user)
    return ComplaintOut.model_validate(c)


@router.get("/{complaint_id}/attachments/{attachment_id}")
def serve_attachment(
    complaint_id: int,
    attachment_id: int,
    user: CurrentUser,
    db: Session = Depends(get_db),
):
    """Serve a complaint attachment file with proper content type (optional; static /uploads also works)."""
    complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Get the attachment
    attachment = db.query(ComplaintAttachment).filter(
        ComplaintAttachment.attachment_id == attachment_id,
        ComplaintAttachment.complaint_id == complaint_id,
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    # file_path is relative to uploads/ (e.g. complaints/1/file.jpg)
    backend_root = Path(__file__).resolve().parent.parent.parent
    full_path = backend_root / "uploads" / attachment.file_path
    
    # Check if file exists
    if not full_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    # Read and return the file with correct content type
    try:
        with open(full_path, "rb") as f:
            file_content = f.read()
        return Response(
            content=file_content,
            media_type=attachment.mime_type,
            headers={"Content-Disposition": f"inline; filename={attachment.file_name}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")

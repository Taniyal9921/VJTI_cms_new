from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, computed_field

from app.models.complaint import ApprovalStatus, ComplaintStatus, ComplaintType, Priority
from app.schemas.location import LocationOut


class ComplaintAttachmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    attachment_id: int
    complaint_id: int
    file_name: str
    file_path: str
    file_type: str
    mime_type: str
    file_size: int
    uploaded_at: datetime

    @computed_field
    @property
    def url(self) -> str:
        p = self.file_path.replace("\\", "/").strip("/")
        return f"/uploads/{p}"


class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    complaint_type: ComplaintType
    priority: Priority
    department_id: int
    building_name: str = Field(..., min_length=1, max_length=128)
    floor_number: str = Field(..., min_length=1, max_length=32)
    location_detail: str = Field(
        "",
        max_length=128,
        description="Room, wing, or other detail; combined with building and floor for the full location",
    )


class ComplaintUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    priority: Priority | None = None


class AssignmentBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    assignment_id: int
    assigned_to: int
    assigned_by: int
    assigned_date: datetime
    completion_date: datetime | None
    assignment_status: str
    work_notes: str | None


class FeedbackBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feedback_id: int
    complaint_id: int
    rating: int
    feedback_comment: str
    confirmed: bool
    feedback_date: datetime


class StatusHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    history_id: int
    complaint_id: int
    changed_by: int
    old_status: str | None
    new_status: str
    remarks: str | None
    changed_at: datetime


class ComplaintOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    complaint_id: int
    title: str
    description: str
    complaint_type: ComplaintType
    priority: Priority
    status: ComplaintStatus
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None
    location_id: int
    raised_by: int
    department_id: int
    approval_status: ApprovalStatus
    approved_by: int | None
    approval_date: datetime | None
    location: LocationOut | None = None
    attachments: List[ComplaintAttachmentOut] = Field(default_factory=list)


class ComplaintDetail(ComplaintOut):
    assignments: List[AssignmentBrief] = []
    status_history: List[StatusHistoryOut] = []
    feedback: Optional[FeedbackBrief] = None


class StatusUpdateRequest(BaseModel):
    new_status: ComplaintStatus
    remarks: str | None = None


class ApproveRejectBody(BaseModel):
    remarks: str | None = None

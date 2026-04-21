from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FeedbackCreate(BaseModel):
    complaint_id: int
    rating: int = Field(..., ge=1, le=5)
    feedback_comment: str = Field(..., min_length=1)
    confirmed: bool = False


class FeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feedback_id: int
    complaint_id: int
    rating: int
    feedback_comment: str
    confirmed: bool
    feedback_date: datetime

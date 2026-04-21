from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import UserRole


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: str
    email: EmailStr
    phone: str | None
    role: UserRole
    department_id: int | None
    designation: str | None
    student_reg_no: str | None = None
    year_of_study: str | None = None
    created_at: datetime
    status: str


class UserOut(UserPublic):
    """Same as public profile; extend later if internal fields are needed."""

    pass

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DepartmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    department_id: int
    department_name: str
    building_name: str | None
    hod_id: int | None
    contact_email: str | None
    created_at: datetime

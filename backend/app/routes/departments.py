"""Read-only department list for signup forms and UI pickers."""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.department import Department
from app.schemas.department import DepartmentOut

router = APIRouter()


@router.get("", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db)) -> List[DepartmentOut]:
    rows = db.execute(select(Department).order_by(Department.department_id)).scalars().all()
    return [DepartmentOut.model_validate(d) for d in rows]

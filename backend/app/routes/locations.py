"""Locations scoped by department for complaint creation."""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.location import Location
from app.schemas.location import LocationOut

router = APIRouter()


@router.get("", response_model=List[LocationOut])
def list_locations(
    db: Session = Depends(get_db),
    department_id: Optional[int] = Query(None),
) -> List[LocationOut]:
    stmt = select(Location).order_by(Location.location_id)
    if department_id is not None:
        stmt = stmt.where(Location.department_id == department_id)
    rows = db.execute(stmt).scalars().all()
    return [LocationOut.model_validate(x) for x in rows]

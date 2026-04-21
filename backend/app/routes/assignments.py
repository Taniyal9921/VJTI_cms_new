from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.schemas.assignment import AssignmentCreate, AssignmentOut, AssignmentUpdate
from app.services import assignment_service

router = APIRouter()


@router.post("", response_model=AssignmentOut)
def create_assignment(
    payload: AssignmentCreate,
    user: CurrentUser,
    db: Session = Depends(get_db),
) -> AssignmentOut:
    a = assignment_service.create_assignment(db, payload, user)
    return AssignmentOut.model_validate(a)


@router.patch("/{assignment_id}", response_model=AssignmentOut)
def patch_assignment(
    assignment_id: int,
    payload: AssignmentUpdate,
    user: CurrentUser,
    db: Session = Depends(get_db),
) -> AssignmentOut:
    a = assignment_service.update_assignment(db, assignment_id, payload, user)
    return AssignmentOut.model_validate(a)

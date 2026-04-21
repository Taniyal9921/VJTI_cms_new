from typing import Annotated, List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import CurrentUser, get_current_user, require_manager_or_hod
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserOut

router = APIRouter()


@router.get("/me", response_model=UserOut)
def read_me(user: CurrentUser) -> UserOut:
    return UserOut.model_validate(user)


@router.get("", response_model=List[UserOut])
def list_users(
    _mgr: Annotated[User, Depends(require_manager_or_hod)],
    db: Session = Depends(get_db),
    role: UserRole | None = None,
) -> List[UserOut]:
    stmt = select(User).order_by(User.user_id)
    if role is not None:
        stmt = stmt.where(User.role == role)
    rows = db.execute(stmt).scalars().all()
    return [UserOut.model_validate(u) for u in rows]

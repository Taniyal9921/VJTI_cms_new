"""
Admin routes — user verification and role management.

Only accessible by users with the Admin role.
"""
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.deps import require_roles
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserOut

router = APIRouter()


@router.get("/users", response_model=List[UserOut])
def list_users_for_admin(
    _admin: Annotated[User, Depends(require_roles(UserRole.ADMIN))],
    db: Session = Depends(get_db),
    user_status: Annotated[str | None, Query(alias="user_status")] = None,
) -> List[UserOut]:
    """List all users, optionally filtered by status (pending, active, rejected)."""
    stmt = select(User).order_by(User.created_at.desc())
    if user_status is not None:
        stmt = stmt.where(func.lower(User.status) == user_status.lower())
    rows = db.execute(stmt).scalars().all()
    return [UserOut.model_validate(u) for u in rows]


@router.get("/stats")
def admin_stats(
    _admin: Annotated[User, Depends(require_roles(UserRole.ADMIN))],
    db: Session = Depends(get_db),
) -> dict:
    """Return counts of users by status."""
    rows = db.execute(
        select(func.lower(User.status), func.count(User.user_id)).group_by(func.lower(User.status))
    ).all()
    counts = {row[0]: row[1] for row in rows}
    return {
        "pending": counts.get("pending", 0),
        "active": counts.get("active", 0),
        "rejected": counts.get("rejected", 0),
        "total": sum(counts.values()),
    }


@router.post("/users/{user_id}/approve", response_model=UserOut)
def approve_user(
    user_id: int,
    _admin: Annotated[User, Depends(require_roles(UserRole.ADMIN))],
    db: Session = Depends(get_db),
) -> UserOut:
    """Set a user's status to active, confirming their role."""
    user = db.execute(select(User).where(User.user_id == user_id)).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if (user.status or "").lower() == "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already active")
    user.status = "active"
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.post("/users/{user_id}/reject", response_model=UserOut)
def reject_user(
    user_id: int,
    _admin: Annotated[User, Depends(require_roles(UserRole.ADMIN))],
    db: Session = Depends(get_db),
) -> UserOut:
    """Set a user's status to rejected, denying access."""
    user = db.execute(select(User).where(User.user_id == user_id)).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if (user.status or "").lower() == "rejected":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already rejected")
    user.status = "rejected"
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)

"""
FastAPI dependencies: DB session + current user + RBAC.

Role-based flow (summary):
- JWT identifies the user; we load the full row for department_id and role checks.
- HOD actions compare `user.user_id` to `department.hod_id` for that complaint's department.
- HK_Manager handles Housekeeping; Maint_Manager handles Maintenance after HOD approval.
- Admin verifies newly registered users before they can access the system.
"""
from typing import Annotated, Callable, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import safe_decode_token
from app.db.session import get_db
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)


def get_token_payload(
    creds: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)],
) -> dict:
    if creds is None or not creds.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = safe_decode_token(creds.credentials)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return payload


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    payload: Annotated[dict, Depends(get_token_payload)],
) -> User:
    """Load user from JWT. Allows both active and pending users so they can
    check their own status via /users/me."""
    uid = payload.get("sub")
    if uid is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    user = db.execute(select(User).where(User.user_id == int(uid))).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    user_status = (user.status or "").lower()
    if user_status not in ("active", "pending"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account inactive")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_active_user(user: CurrentUser) -> User:
    """Block pending/inactive users from accessing protected resources."""
    if (user.status or "").lower() != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending admin approval",
        )
    return user


ActiveUser = Annotated[User, Depends(require_active_user)]


def require_admin(user: CurrentUser) -> User:
    """Restrict route to Admin role only."""
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    if (user.status or "").lower() != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account inactive")
    return user


def require_roles(*allowed: UserRole) -> Callable[..., User]:
    """Factory: Depends(require_roles(UserRole.HOD)) restricts route to those roles."""
    allowed_set = frozenset(allowed)

    def _dep(user: CurrentUser) -> User:
        if user.role not in allowed_set:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return _dep


def require_manager_or_hod(user: CurrentUser) -> User:
    """
    GET /users is restricted to operational admins.
    ER has no separate Admin; we treat HK_Manager, Maint_Manager, HOD, and Admin as user-directory viewers.
    """
    if user.role not in (
        UserRole.HK_MANAGER,
        UserRole.MAINT_MANAGER,
        UserRole.HOD,
        UserRole.ADMIN,
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or manager role required")
    return user


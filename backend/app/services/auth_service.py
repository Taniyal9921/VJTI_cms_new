from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.department import Department
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, RegisterRequest

_STAFF_ROLE_ALIASES = {"Staff_Maint": UserRole.STAFF, "Staff_HK": UserRole.STAFF}


def _resolve_register_role(role_str: str) -> UserRole:
    if role_str in _STAFF_ROLE_ALIASES:
        return _STAFF_ROLE_ALIASES[role_str]
    return UserRole(role_str)


def _department_id_from_name(db: Session, department_name: str | None) -> int | None:
    if department_name is None or not department_name.strip():
        return None
    name = department_name.strip()
    dept = db.scalars(
        select(Department).where(func.lower(Department.department_name) == name.lower())
    ).first()
    if dept is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown department: {name}",
        )
    return dept.department_id


def register_user(db: Session, data: RegisterRequest) -> User:
    existing = db.scalars(select(User).where(User.email == str(data.email).lower())).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    department_id = _department_id_from_name(db, data.department_name)

    role = _resolve_register_role(data.role)
    designation = data.designation
    if data.role == "Staff_Maint" and not (designation and designation.strip()):
        designation = "Maintenance Staff"
    elif data.role == "Staff_HK" and not (designation and designation.strip()):
        designation = "Housekeeping Staff"

    user = User(
        name=data.name,
        email=str(data.email).lower(),
        phone=data.phone,
        password_hash=get_password_hash(data.password),
        role=role,
        department_id=department_id,
        designation=designation,
        student_reg_no=(data.student_reg_no.strip() if data.student_reg_no else None)
        if data.role == "Student"
        else None,
        year_of_study=(data.year_of_study.strip() if data.year_of_study else None)
        if data.role == "Student"
        else None,
        created_at=datetime.now(timezone.utc),
        status="pending",
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create user (check email uniqueness and department)",
        ) from None
    db.refresh(user)
    return user


def authenticate(db: Session, data: LoginRequest) -> tuple[User, str]:
    user = db.scalars(select(User).where(User.email == str(data.email).lower())).first()
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user_status = (user.status or "").lower()
    if user_status not in ("active", "pending"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account inactive or rejected")
    token = create_access_token(user.user_id, extra_claims={"role": user.role.value})
    return user, token


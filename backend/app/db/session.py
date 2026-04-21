"""
Database session factory.

ER → DB: one Engine per process; SessionLocal is the dependency-injected unit of work per request.
"""
from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.db.base import Base

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


def init_db() -> None:
    """Create tables if they do not exist (dev/bootstrap). Prefer Alembic in production."""
    from app.models import (  # noqa: F401 — register mappers
        assignment,
        complaint,
        complaint_attachment,
        department,
        feedback,
        location,
        status_history,
        user,
    )

    Base.metadata.create_all(bind=engine)

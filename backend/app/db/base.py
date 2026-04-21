"""SQLAlchemy declarative base — imported by all models for metadata registration."""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass

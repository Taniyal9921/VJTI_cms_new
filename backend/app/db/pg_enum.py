"""PostgreSQL ENUM columns that store PEP 435 enum *values* (e.g. \"Student\"), not member names (\"STUDENT\")."""
from enum import Enum as PyEnum
from typing import Type

from sqlalchemy import Enum as SAEnum


def pg_enum(py_enum: Type[PyEnum], *, name: str) -> SAEnum:
    return SAEnum(
        py_enum,
        name=name,
        values_callable=lambda cls: [m.value for m in cls],
    )

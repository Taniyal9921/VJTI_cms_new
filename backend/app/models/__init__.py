"""
ORM models — one-to-one mapping from ER entities to SQLAlchemy tables.

Tables: users, departments, locations, complaints, assignments, status_histories, feedbacks
"""
from app.models.assignment import Assignment
from app.models.complaint import Complaint
from app.models.complaint_attachment import ComplaintAttachment
from app.models.department import Department
from app.models.feedback import Feedback
from app.models.location import Location
from app.models.status_history import StatusHistory
from app.models.user import User, UserRole

__all__ = [
    "User",
    "UserRole",
    "Department",
    "Location",
    "Complaint",
    "ComplaintAttachment",
    "Assignment",
    "StatusHistory",
    "Feedback",
]

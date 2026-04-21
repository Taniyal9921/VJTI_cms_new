from fastapi import APIRouter

from app.routes import admin, assignments, auth, complaints, dashboard, departments, feedback, locations, users


def build_api_router() -> APIRouter:
    api = APIRouter()
    api.include_router(auth.router, prefix="/auth", tags=["auth"])
    api.include_router(departments.router, prefix="/departments", tags=["departments"])
    api.include_router(locations.router, prefix="/locations", tags=["locations"])
    api.include_router(users.router, prefix="/users", tags=["users"])
    api.include_router(complaints.router, prefix="/complaints", tags=["complaints"])
    api.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
    api.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
    api.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
    api.include_router(admin.router, prefix="/admin", tags=["admin"])
    return api


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.schemas.dashboard import DashboardStats
from app.services import dashboard_service

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def stats(
    user: CurrentUser,
    db: Session = Depends(get_db),
) -> DashboardStats:
    return dashboard_service.get_dashboard_stats(db, user)

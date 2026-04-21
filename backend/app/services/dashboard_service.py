"""Aggregated metrics for role-aware dashboard cards (see GET /dashboard/stats)."""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.assignment import Assignment, AssignmentStatus
from app.models.complaint import ApprovalStatus, Complaint, ComplaintStatus, ComplaintType
from app.models.user import User, UserRole
from app.schemas.dashboard import DashboardStats


def get_dashboard_stats(db: Session, user: User) -> DashboardStats:
    total = db.execute(select(func.count()).select_from(Complaint)).scalar_one()

    by_status: dict[str, int] = {}
    for st in ComplaintStatus:
        n = db.execute(select(func.count()).select_from(Complaint).where(Complaint.status == st)).scalar_one()
        by_status[st.value] = int(n)

    by_type: dict[str, int] = {}
    for ct in ComplaintType:
        n = db.execute(select(func.count()).select_from(Complaint).where(Complaint.complaint_type == ct)).scalar_one()
        by_type[ct.value] = int(n)

    pending_maintenance_approvals = 0
    if user.role == UserRole.HOD and user.department_id is not None:
        pending_maintenance_approvals = db.execute(
            select(func.count())
            .select_from(Complaint)
            .where(
                Complaint.department_id == user.department_id,
                Complaint.complaint_type == ComplaintType.MAINTENANCE,
                Complaint.approval_status == ApprovalStatus.PENDING,
            )
        ).scalar_one()
    elif user.role in (UserRole.HK_MANAGER, UserRole.MAINT_MANAGER):
        pending_maintenance_approvals = db.execute(
            select(func.count())
            .select_from(Complaint)
            .where(
                Complaint.complaint_type == ComplaintType.MAINTENANCE,
                Complaint.approval_status == ApprovalStatus.PENDING,
            )
        ).scalar_one()

    open_for_me = 0
    if user.role == UserRole.STAFF:
        open_for_me = db.execute(
            select(func.count())
            .select_from(Assignment)
            .where(
                Assignment.assigned_to == user.user_id,
                Assignment.assignment_status.in_((AssignmentStatus.PENDING, AssignmentStatus.IN_PROGRESS)),
            )
        ).scalar_one()

    my_open = 0
    if user.role in (UserRole.STUDENT, UserRole.FACULTY):
        my_open = db.execute(
            select(func.count())
            .select_from(Complaint)
            .where(
                Complaint.raised_by == user.user_id,
                Complaint.status != ComplaintStatus.CLOSED,
            )
        ).scalar_one()

    return DashboardStats(
        total_complaints=int(total),
        by_status=by_status,
        by_type=by_type,
        pending_maintenance_approvals=int(pending_maintenance_approvals),
        open_assignments_for_me=int(open_for_me),
        my_open_complaints=int(my_open),
    )

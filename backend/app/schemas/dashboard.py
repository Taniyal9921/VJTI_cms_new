from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_complaints: int
    by_status: dict[str, int]
    by_type: dict[str, int]
    pending_maintenance_approvals: int
    open_assignments_for_me: int
    my_open_complaints: int

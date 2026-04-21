"""
Populate demo departments, locations, and role users for viva / local testing.

Run from `backend/` after DB exists and tables are created:
  python scripts/seed_demo.py

Default passwords (change in production): Demo@12345
"""
import sys
from pathlib import Path

_backend_root = Path(__file__).resolve().parent.parent
if str(_backend_root) not in sys.path:
    sys.path.insert(0, str(_backend_root))

from datetime import datetime, timezone

from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import SessionLocal, init_db
from app.models.department import Department
from app.models.location import Location
from app.models.user import User, UserRole


def run() -> None:
    init_db()
    db = SessionLocal()
    try:
        if db.execute(select(User).where(User.email == "hod@college.edu")).scalar_one_or_none():
            print("Seed already applied (hod@college.edu exists).")
            return

        now = datetime.now(timezone.utc)
        dept_seed = [
            ("Computer Science", "cs@vjti.edu"),
            ("Civil Engineering", "civil@vjti.edu"),
            ("Textile Engineering", "textile@vjti.edu"),
            ("Electrical Engineering", "electrical@vjti.edu"),
            ("Mechanical Engineering", "mech@vjti.edu"),
            ("Information Technology", "it@vjti.edu"),
            ("Production Engineering", "prod@vjti.edu"),
            ("Chemical Engineering", "chem@vjti.edu"),
            (
                "Electronics and Telecommunication Engineering",
                "extc@vjti.edu",
            ),
        ]
        depts: list[Department] = []
        for dept_name, contact in dept_seed:
            d = Department(
                department_name=dept_name,
                building_name="Main Block",
                hod_id=None,
                contact_email=contact,
                created_at=now,
            )
            db.add(d)
            depts.append(d)
        db.flush()
        dept = depts[0]

        hod = User(
            name="Dr. HOD CE",
            email="hod@college.edu",
            phone="9000000001",
            password_hash=get_password_hash("Demo@12345"),
            role=UserRole.HOD,
            department_id=dept.department_id,
            designation="Professor",
            created_at=now,
            status="active",
        )
        db.add(hod)
        db.flush()
        dept.hod_id = hod.user_id

        hk = User(
            name="HK Manager",
            email="hk@college.edu",
            phone="9000000002",
            password_hash=get_password_hash("Demo@12345"),
            role=UserRole.HK_MANAGER,
            department_id=None,
            designation="Housekeeping Manager",
            created_at=now,
            status="active",
        )
        maint = User(
            name="Maint Manager",
            email="maint@college.edu",
            phone="9000000003",
            password_hash=get_password_hash("Demo@12345"),
            role=UserRole.MAINT_MANAGER,
            department_id=None,
            designation="Maintenance Manager",
            created_at=now,
            status="active",
        )
        staff = User(
            name="Staff One",
            email="staff@college.edu",
            phone="9000000004",
            password_hash=get_password_hash("Demo@12345"),
            role=UserRole.STAFF,
            department_id=dept.department_id,
            designation="Technician",
            created_at=now,
            status="active",
        )
        student = User(
            name="Student Demo",
            email="student@college.edu",
            phone="9000000005",
            password_hash=get_password_hash("Demo@12345"),
            role=UserRole.STUDENT,
            department_id=dept.department_id,
            designation="UG",
            created_at=now,
            status="active",
        )
        db.add_all([hk, maint, staff, student])
        db.flush()

        loc = Location(
            building_name="Main Block",
            floor_number="2",
            room_number="CE-201",
            department_id=dept.department_id,
            location_type="Classroom",
        )
        db.add(loc)
        db.commit()
        print("Seed complete. Log in with student@college.edu / Demo@12345 (and other demo accounts).")
    finally:
        db.close()


if __name__ == "__main__":
    run()

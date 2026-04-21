# College Complaint Management System

Production-style full-stack app for a VJTI-like campus: **housekeeping** (direct HK manager assignment) vs **maintenance** (HOD approval → maintenance manager assignment), with JWT auth, PostgreSQL, and role-based UI.

## Folder structure

```
db_cursor/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, router mount (/api)
│   │   ├── core/                # settings, JWT/password helpers, RBAC deps
│   │   ├── db/                  # engine, SessionLocal, init_db (create_all)
│   │   ├── models/              # SQLAlchemy ↔ ER entities
│   │   ├── schemas/             # Pydantic request/response DTOs
│   │   ├── routes/              # Thin HTTP layer
│   │   └── services/            # Business rules (approval, assignment, close)
│   ├── scripts/seed_demo.py     # Demo users + department + location
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client + CMS endpoints
│   │   ├── components/          # Navbar, Sidebar, Timeline, Modal, UI
│   │   ├── context/             # Auth (JWT in localStorage)
│   │   ├── pages/               # Login, Dashboard, Complaints, etc.
│   │   ├── types/models.ts      # Types aligned with API enums
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
└── README.md
```

### ER → database mapping

| ER entity       | SQLAlchemy model   | Table            |
|----------------|--------------------|------------------|
| USER           | `User`             | `users`          |
| DEPARTMENT     | `Department`       | `departments`    |
| LOCATION       | `Location`         | `locations`      |
| COMPLAINT      | `Complaint`        | `complaints`     |
| ASSIGNMENT     | `Assignment`       | `assignments`    |
| STATUS_HISTORY | `StatusHistory`    | `status_histories` |
| FEEDBACK       | `Feedback`         | `feedbacks`      |

Design comments in `backend/app/models/*.py` and `backend/app/services/complaint_service.py` explain housekeeping vs maintenance flows and the **close** rule (assignment **Done** + feedback **confirmed**).

## Backend setup

1. **PostgreSQL** — pick one:

   **A. Docker (easiest)** — from repo root:

   ```powershell
   docker compose up -d
   ```

   Then use `DATABASE_URL=postgresql://cms_user:cms_pass@127.0.0.1:5432/college_cms` in `backend/.env`.

   **B. Local install** — connect as superuser (`postgres`) and run `backend/scripts/setup_postgres.sql`, or:

   ```sql
   CREATE USER cms_user WITH PASSWORD 'cms_pass';
   CREATE DATABASE college_cms OWNER cms_user;
   ```

2. **Environment** — **required:** copy `backend/.env.example` → `backend/.env` and set `DATABASE_URL` to match your server.

   If you **skip** creating `backend/.env`, the app still uses the default URL in `app/core/config.py` (`cms_user` / `college_cms`). That fails until that user and database exist — which is the usual cause of:

   `FATAL: password authentication failed for user "cms_user"`.

   If you use your own login (e.g. `postgres` and database `vjti_cms`), put that in `DATABASE_URL` only in `backend/.env` (never commit real passwords). Encode special characters in the password (`@` → `%40`).

3. **Python virtualenv** (from repo root or `backend/`):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

4. **Run API** (creates tables on startup via `init_db()` — use Alembic migrations for real production):

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. **Seed demo data** (optional):

```powershell
python scripts/seed_demo.py
```

Demo passwords: `Demo@12345` for seeded accounts (`student@college.edu`, `hod@college.edu`, `hk@college.edu`, `maint@college.edu`, `staff@college.edu`).

### API base path

All JSON routes are under **`/api`** (e.g. `POST /api/auth/login`). Health: `GET /health`.

## Frontend setup

```powershell
cd frontend
npm install
npm run dev
```

- Dev server: `http://localhost:5173` — Vite proxies `/api` to `http://127.0.0.1:8000` (see `frontend/vite.config.ts`).
- Production build: `npm run build` → static assets in `frontend/dist/`.
- Optional env: see `frontend/.env.example` (`VITE_API_URL`).

### Frontend ↔ backend wiring

| Axios base (`src/api/client.ts`) | Joined path (`src/api/cms.ts`) | FastAPI route |
|----------------------------------|--------------------------------|---------------|
| `/api` (dev default) or `VITE_API_URL` | `/auth/login` | `POST /api/auth/login` |
| same | `/auth/register` | `POST /api/auth/register` |
| same | `/users/me` | `GET /api/users/me` |
| same | `/users` | `GET /api/users` |
| same | `/departments` | `GET /api/departments` |
| same | `/locations` | `GET /api/locations` |
| same | `/complaints` | `GET/POST /api/complaints` |
| same | `/complaints/{id}` | `GET/PATCH/DELETE /api/complaints/{id}` |
| same | `/complaints/{id}/approve` etc. | matching `/api/complaints/...` |
| same | `/assignments` | `POST /api/assignments` |
| same | `/assignments/{id}` | `PATCH /api/assignments/{id}` |
| same | `/feedback` | `POST /api/feedback` |
| same | `/dashboard/stats` | `GET /api/dashboard/stats` |

JWT: `Authorization: Bearer <token>` is set in `client.ts` after login / from `localStorage`.

**Smoke test** (backend running, DB seeded): `powershell -ExecutionPolicy Bypass -File scripts/smoke_api.ps1`

## Role-based UX (where it lives)

- **Sidebar**: `frontend/src/components/Sidebar.tsx` — different links per `User.role`.
- **Backend enforcement**: `backend/app/core/deps.py` (JWT + `require_roles`), plus checks in `services/*` (e.g. HOD must match `departments.hod_id`).

## Advanced / viva notes

- **Polling**: dashboard and complaint list refresh on an interval (see `DashboardPage`, `ComplaintsPage`, `ComplaintDetailPage`).
- **Optional file uploads / in-app notifications**: not implemented; hooks would go in `services` + a `attachments` table if you extend the ER.

## API summary (required endpoints)

| Area        | Method & path |
|------------|----------------|
| Auth       | `POST /api/auth/register`, `POST /api/auth/login` |
| Users      | `GET /api/users/me`, `GET /api/users` (managers/HOD) |
| Complaints | `POST/GET /api/complaints`, `GET/PATCH/DELETE /api/complaints/{id}` |
| Approval   | `POST /api/complaints/{id}/approve`, `POST /api/complaints/{id}/reject` |
| Assignment | `POST /api/assignments`, `PATCH /api/assignments/{id}` |
| Status     | `POST /api/complaints/{id}/status-update` |
| Feedback   | `POST /api/feedback` |
| Dashboard  | `GET /api/dashboard/stats` |

Extra helpers for the UI: `GET /api/departments`, `GET /api/locations?department_id=`.

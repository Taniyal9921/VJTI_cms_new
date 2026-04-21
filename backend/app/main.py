"""
Complaint Management System — FastAPI entrypoint.

ER → relational tables are defined under `app.models`; business workflows live in `app.services`.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import init_db
from app.routes import build_api_router
import os
from fastapi.staticfiles import StaticFiles

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="College Complaint Management System", lifespan=lifespan)

# Create the folders if they don't exist
if not os.path.exists("uploads/complaints"):
    os.makedirs("uploads/complaints", exist_ok=True)

# Mount uploads directory for serving complaint attachments
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Lets browsers read pagination total when frontend uses absolute VITE_API_URL (cross-origin).
    expose_headers=["X-Total-Count"],
)

app.include_router(build_api_router(), prefix="/api")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

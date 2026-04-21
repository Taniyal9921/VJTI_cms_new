"""
File upload utilities for complaints.
Handles saving and managing complaint attachments.
"""
from datetime import datetime, timezone
from pathlib import Path

from fastapi import UploadFile

# Base directory for uploads
UPLOADS_DIR = Path(__file__).parent.parent.parent / "uploads" / "complaints"
# Allowed MIME types for security
ALLOWED_MIME_TYPES = {
    # Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    # Videos
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "video/x-msvideo",
    "video/x-matroska",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


def ensure_upload_directory() -> None:
    """Create the uploads directory if it doesn't exist."""
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def get_file_type(mime_type: str) -> str:
    """Determine file type from MIME type."""
    if mime_type.startswith("image/"):
        return "image"
    elif mime_type.startswith("video/"):
        return "video"
    return "document"


async def save_complaint_file(complaint_id: int, file: UploadFile) -> tuple[str, str, int]:
    """
    Save an uploaded file for a complaint.

    Args:
        complaint_id: The complaint ID
        file: The uploaded file

    Returns:
        Tuple of (file_path, mime_type, file_size)

    Raises:
        ValueError: If file type is not allowed or file is too large
    """
    # Validate MIME type
    mime_type = file.content_type or "application/octet-stream"
    if mime_type not in ALLOWED_MIME_TYPES:
        raise ValueError(f"File type {mime_type} not allowed")

    ensure_upload_directory()

    # Create complaint-specific directory
    complaint_dir = UPLOADS_DIR / str(complaint_id)
    complaint_dir.mkdir(parents=True, exist_ok=True)

    # Read file contents first to check size
    contents = await file.read()
    file_size = len(contents)

    if file_size > MAX_FILE_SIZE:
        raise ValueError(f"File size ({file_size} bytes) exceeds maximum of {MAX_FILE_SIZE} bytes")

    # Generate unique filename with timestamp
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{timestamp}_{file.filename}"
    file_path = complaint_dir / unique_filename

    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)

    # Return direct URL path for static serving (file:/uploads/complaints/{id}/{filename})
    # Use forward slashes for URL paths (convert Windows backslashes to forward slashes)
    url_path = f"complaints/{complaint_id}/{unique_filename}"
    return url_path, mime_type, file_size

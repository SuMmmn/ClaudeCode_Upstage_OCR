"""파일 업로드 검증 및 저장 유틸리티."""

import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "application/pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_file(filename: str, content_type: str, size: int) -> None:
    """확장자·MIME 타입·파일 크기 검증. 위반 시 HTTPException 발생."""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"허용되지 않는 파일 형식입니다. 허용 형식: {', '.join(ALLOWED_EXTENSIONS)}",
        )
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"허용되지 않는 MIME 타입입니다: {content_type}",
        )
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="파일 크기는 10MB 이하여야 합니다.",
        )


def save_file(filename: str, content: bytes) -> str:
    """UUID 기반 파일명으로 저장 후 경로 반환."""
    os.makedirs(settings.upload_dir, exist_ok=True)
    ext = Path(filename).suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.upload_dir, unique_name)
    with open(file_path, "wb") as f:
        f.write(content)
    return file_path

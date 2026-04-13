from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import categories, receipts, stats

app = FastAPI(
    title="AI 영수증 지출 관리 API",
    description="Upstage Vision LLM 기반 영수증 OCR 및 지출 관리 서비스",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(receipts.router, prefix="/api/receipts", tags=["receipts"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])

# 업로드된 이미지 정적 서빙
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.on_event("startup")
def on_startup():
    import os
    os.makedirs(settings.upload_dir, exist_ok=True)
    os.makedirs("data", exist_ok=True)
    init_db()


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "message": "AI 영수증 지출 관리 API"}

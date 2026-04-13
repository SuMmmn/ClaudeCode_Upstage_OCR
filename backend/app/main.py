from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi

from app.config import settings
from app.database import init_db
from app.routers import categories, receipts, stats

# ---------------------------------------------------------------------------
# 태그 메타데이터
# ---------------------------------------------------------------------------
TAGS_METADATA = [
    {
        "name": "receipts",
        "description": (
            "영수증 업로드 및 CRUD 관리.\n\n"
            "- `POST /upload` — 이미지(JPG·PNG) 또는 PDF를 업로드하면 "
            "**Upstage Document Parse** API로 텍스트를 추출하고 "
            "**Solar LLM**이 구조화된 JSON으로 변환하여 DB에 저장합니다.\n"
            "- 지원 파일 형식: `image/jpeg`, `image/png`, `application/pdf`\n"
            "- 최대 파일 크기: **10MB**"
        ),
    },
    {
        "name": "stats",
        "description": (
            "지출 통계 집계.\n\n"
            "`start_date` / `end_date` 파라미터로 기간을 지정하면 "
            "카테고리별·월별·일별 합계와 비율을 반환합니다."
        ),
    },
    {
        "name": "categories",
        "description": "지출 카테고리 목록 조회. 7개 고정 카테고리를 반환합니다.",
    },
    {
        "name": "health",
        "description": "서버 상태 확인용 헬스체크 엔드포인트.",
    },
]

# ---------------------------------------------------------------------------
# FastAPI 앱
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI 영수증 지출 관리 API",
    version="1.0.0",
    description="""
## 개요

영수증 이미지(JPG, PNG) 또는 PDF를 업로드하면 **Upstage Vision LLM**이 자동으로
내용을 OCR 분석하여 지출 항목을 구조화하고 소비 패턴을 집계하는 REST API입니다.

## 주요 기능

| 기능 | 엔드포인트 |
|------|-----------|
| 영수증 업로드 & OCR 분석 | `POST /api/receipts/upload` |
| 영수증 목록 조회 (필터·페이지네이션) | `GET /api/receipts` |
| 영수증 상세 조회 | `GET /api/receipts/{id}` |
| 영수증 수정 | `PUT /api/receipts/{id}` |
| 영수증 삭제 | `DELETE /api/receipts/{id}` |
| 기간별 통계 | `GET /api/stats/summary` |
| 카테고리 목록 | `GET /api/categories` |

## 인증

현재 버전은 인증 없이 동작합니다 (단일 사용자).

## 에러 코드

| 코드 | 설명 |
|------|------|
| `400` | 잘못된 요청 (파일 형식·크기 오류 등) |
| `404` | 리소스 없음 |
| `422` | 요청 데이터 유효성 검사 실패 |
| `500` | 서버 오류 (OCR 분석 실패 등) |
""",
    openapi_tags=TAGS_METADATA,
    docs_url="/docs",
    redoc_url="/redoc",
    swagger_ui_parameters={
        "defaultModelsExpandDepth": 2,
        "defaultModelExpandDepth": 3,
        "docExpansion": "list",
        "filter": True,
        "tryItOutEnabled": True,
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(receipts.router, prefix="/api/receipts", tags=["receipts"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])

app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.on_event("startup")
def on_startup():
    import os
    os.makedirs(settings.upload_dir, exist_ok=True)
    os.makedirs("data", exist_ok=True)
    init_db()


@app.get(
    "/",
    tags=["health"],
    summary="헬스체크",
    description="서버 정상 동작 여부를 확인합니다.",
)
def health_check():
    return {"status": "ok", "message": "AI 영수증 지출 관리 API"}

"""통계 집계 라우터."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.stats import StatsSummaryResponse
from app.services import stats_service

router = APIRouter()


@router.get("/summary", response_model=StatsSummaryResponse)
async def get_stats_summary(
    start_date: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
):
    """기간별 지출 통계 — 카테고리·월별·일별 집계."""
    return stats_service.get_stats_summary(db, start_date, end_date)

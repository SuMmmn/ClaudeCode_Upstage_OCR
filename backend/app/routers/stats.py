"""통계 집계 라우터."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.stats import StatsSummaryResponse
from app.services import stats_service

router = APIRouter()


@router.get(
    "/summary",
    response_model=StatsSummaryResponse,
    summary="기간별 지출 통계",
    description=(
        "지정한 기간의 지출 통계를 집계하여 반환합니다.\n\n"
        "- **by_category**: 카테고리별 합계 및 비율 (금액 내림차순)\n"
        "- **by_month**: 월별 합계 (YYYY-MM 오름차순)\n"
        "- **by_day**: 일별 합계 (YYYY-MM-DD 오름차순)\n\n"
        "날짜 파라미터를 생략하면 **전체 기간**을 집계합니다."
    ),
)
async def get_stats_summary(
    start_date: str | None = Query(
        default=None,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="집계 시작일 (YYYY-MM-DD)",
        examples=["2026-04-01"],
    ),
    end_date: str | None = Query(
        default=None,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="집계 종료일 (YYYY-MM-DD)",
        examples=["2026-04-30"],
    ),
    db: Session = Depends(get_db),
):
    return stats_service.get_stats_summary(db, start_date, end_date)

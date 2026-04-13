from pydantic import BaseModel, Field


class CategoryStat(BaseModel):
    category: str = Field(..., description="카테고리명", examples=["외식"])
    amount: float = Field(..., description="합계 금액 (원)", examples=[85000.0])
    ratio: float = Field(..., description="비율 (%)", examples=[34.5])


class MonthStat(BaseModel):
    month: str = Field(..., description="연월 (YYYY-MM)", examples=["2026-04"])
    amount: float = Field(..., description="월 합계 금액 (원)", examples=[246000.0])


class DayStat(BaseModel):
    date: str = Field(..., description="날짜 (YYYY-MM-DD)", examples=["2026-04-13"])
    amount: float = Field(..., description="일 합계 금액 (원)", examples=[32000.0])


class StatsSummaryResponse(BaseModel):
    total_amount: float = Field(..., description="기간 합계 금액 (원)", examples=[246000.0])
    by_category: list[CategoryStat] = Field(..., description="카테고리별 집계 (금액 내림차순)")
    by_month: list[MonthStat] = Field(..., description="월별 집계 (오름차순)")
    by_day: list[DayStat] = Field(..., description="일별 집계 (오름차순)")

from pydantic import BaseModel


class CategoryStat(BaseModel):
    category: str
    amount: float
    ratio: float


class MonthStat(BaseModel):
    month: str   # YYYY-MM
    amount: float


class DayStat(BaseModel):
    date: str    # YYYY-MM-DD
    amount: float


class StatsSummaryResponse(BaseModel):
    total_amount: float
    by_category: list[CategoryStat]
    by_month: list[MonthStat]
    by_day: list[DayStat]

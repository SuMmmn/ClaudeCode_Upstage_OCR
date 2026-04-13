"""기간별·카테고리별·월별·일별 지출 집계 로직."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.receipt import Receipt


def get_stats_summary(
    db: Session,
    start_date: str | None = None,
    end_date: str | None = None,
) -> dict:
    stmt = select(Receipt)
    if start_date:
        stmt = stmt.where(Receipt.date >= start_date)
    if end_date:
        stmt = stmt.where(Receipt.date <= end_date)

    receipts = list(db.scalars(stmt))
    total = sum(r.total_amount for r in receipts)

    # 카테고리별 집계
    cat_totals: dict[str, float] = {}
    for r in receipts:
        key = r.category or "기타"
        cat_totals[key] = cat_totals.get(key, 0.0) + r.total_amount

    by_category = [
        {
            "category": k,
            "amount": v,
            "ratio": round(v / total * 100, 1) if total else 0.0,
        }
        for k, v in sorted(cat_totals.items(), key=lambda x: -x[1])
    ]

    # 월별 집계 (YYYY-MM)
    month_totals: dict[str, float] = {}
    for r in receipts:
        key = r.date[:7]
        month_totals[key] = month_totals.get(key, 0.0) + r.total_amount

    by_month = [
        {"month": k, "amount": v}
        for k, v in sorted(month_totals.items())
    ]

    # 일별 집계 (YYYY-MM-DD)
    day_totals: dict[str, float] = {}
    for r in receipts:
        day_totals[r.date] = day_totals.get(r.date, 0.0) + r.total_amount

    by_day = [
        {"date": k, "amount": v}
        for k, v in sorted(day_totals.items())
    ]

    return {
        "total_amount": total,
        "by_category": by_category,
        "by_month": by_month,
        "by_day": by_day,
    }

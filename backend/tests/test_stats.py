"""통계 API 테스트 — 날짜 범위별 집계 결과 검증."""

import pytest
from app.models.receipt import Receipt


def seed(db, store, date, amount, category="식료품"):
    r = Receipt(store_name=store, date=date, total_amount=amount, category=category)
    db.add(r)
    db.commit()
    return r


# ---------------------------------------------------------------------------
# 빈 데이터
# ---------------------------------------------------------------------------

def test_stats_empty(client):
    resp = client.get("/api/stats/summary")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_amount"] == 0
    assert body["by_category"] == []
    assert body["by_month"] == []
    assert body["by_day"] == []


# ---------------------------------------------------------------------------
# 전체 집계
# ---------------------------------------------------------------------------

def test_stats_total_amount(client, db):
    seed(db, "마트A", "2026-04-01", 10000, "식료품")
    seed(db, "마트B", "2026-04-02", 20000, "외식")

    resp = client.get("/api/stats/summary")
    assert resp.status_code == 200
    assert resp.json()["total_amount"] == 30000


def test_stats_by_category(client, db):
    seed(db, "마트", "2026-04-01", 15000, "식료품")
    seed(db, "식당", "2026-04-02", 10000, "외식")
    seed(db, "편의점", "2026-04-03", 5000, "식료품")

    resp = client.get("/api/stats/summary")
    by_cat = {c["category"]: c for c in resp.json()["by_category"]}

    assert by_cat["식료품"]["amount"] == 20000
    assert by_cat["외식"]["amount"] == 10000
    # ratio 합계 ≈ 100
    total_ratio = sum(c["ratio"] for c in resp.json()["by_category"])
    assert abs(total_ratio - 100.0) < 0.5


def test_stats_by_month(client, db):
    seed(db, "마트", "2026-03-15", 10000)
    seed(db, "마트", "2026-04-01", 20000)
    seed(db, "마트", "2026-04-20", 30000)

    resp = client.get("/api/stats/summary")
    by_month = {m["month"]: m["amount"] for m in resp.json()["by_month"]}

    assert by_month["2026-03"] == 10000
    assert by_month["2026-04"] == 50000


def test_stats_by_day(client, db):
    seed(db, "마트A", "2026-04-01", 10000)
    seed(db, "마트B", "2026-04-01", 5000)
    seed(db, "마트C", "2026-04-02", 8000)

    resp = client.get("/api/stats/summary")
    by_day = {d["date"]: d["amount"] for d in resp.json()["by_day"]}

    assert by_day["2026-04-01"] == 15000
    assert by_day["2026-04-02"] == 8000


# ---------------------------------------------------------------------------
# 날짜 필터
# ---------------------------------------------------------------------------

def test_stats_date_filter_start(client, db):
    seed(db, "마트", "2026-03-01", 10000)
    seed(db, "마트", "2026-04-01", 20000)

    resp = client.get("/api/stats/summary?start_date=2026-04-01")
    assert resp.json()["total_amount"] == 20000


def test_stats_date_filter_end(client, db):
    seed(db, "마트", "2026-04-01", 20000)
    seed(db, "마트", "2026-05-01", 10000)

    resp = client.get("/api/stats/summary?end_date=2026-04-30")
    assert resp.json()["total_amount"] == 20000


def test_stats_date_filter_range(client, db):
    seed(db, "마트", "2026-03-01", 5000)
    seed(db, "마트", "2026-04-15", 30000)
    seed(db, "마트", "2026-05-01", 10000)

    resp = client.get("/api/stats/summary?start_date=2026-04-01&end_date=2026-04-30")
    assert resp.json()["total_amount"] == 30000


def test_stats_date_filter_no_result(client, db):
    seed(db, "마트", "2026-04-01", 10000)

    resp = client.get("/api/stats/summary?start_date=2026-05-01&end_date=2026-05-31")
    assert resp.json()["total_amount"] == 0


def test_stats_invalid_date_format(client):
    resp = client.get("/api/stats/summary?start_date=2026/04/01")
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# 카테고리 미지정 → '기타' 처리
# ---------------------------------------------------------------------------

def test_stats_null_category_grouped_as_기타(client, db):
    r = Receipt(store_name="무명가게", date="2026-04-01", total_amount=7000, category=None)
    db.add(r)
    db.commit()

    resp = client.get("/api/stats/summary")
    by_cat = {c["category"]: c for c in resp.json()["by_category"]}
    assert "기타" in by_cat
    assert by_cat["기타"]["amount"] == 7000

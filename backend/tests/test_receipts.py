"""영수증 CRUD API 핵심 Happy Path 테스트."""

from io import BytesIO
from unittest.mock import AsyncMock, patch

import pytest

from app.models.receipt import Receipt
from app.models.receipt_item import ReceiptItem


# ---------------------------------------------------------------------------
# 헬퍼
# ---------------------------------------------------------------------------

def make_receipt(db, store_name="테스트마트", date_str="2026-04-01", total=50000.0, category="식료품"):
    r = Receipt(store_name=store_name, date=date_str, total_amount=total, category=category)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


# ---------------------------------------------------------------------------
# 목록 조회
# ---------------------------------------------------------------------------

def test_list_receipts_empty(client):
    resp = client.get("/api/receipts")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 0
    assert body["items"] == []


def test_list_receipts_returns_all(client, db):
    make_receipt(db, "마트A", "2026-04-01", 10000)
    make_receipt(db, "마트B", "2026-04-02", 20000)

    resp = client.get("/api/receipts")
    assert resp.status_code == 200
    assert resp.json()["total"] == 2


def test_list_receipts_filter_category(client, db):
    make_receipt(db, "식당", "2026-04-01", 15000, "외식")
    make_receipt(db, "마트", "2026-04-01", 30000, "식료품")

    resp = client.get("/api/receipts?category=외식")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    assert body["items"][0]["store_name"] == "식당"


def test_list_receipts_filter_store_name(client, db):
    make_receipt(db, "이마트", "2026-04-01", 10000)
    make_receipt(db, "롯데마트", "2026-04-01", 10000)

    resp = client.get("/api/receipts?store_name=이마트")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


def test_list_receipts_filter_date_range(client, db):
    make_receipt(db, "마트A", "2026-03-01", 10000)
    make_receipt(db, "마트B", "2026-04-01", 10000)
    make_receipt(db, "마트C", "2026-05-01", 10000)

    resp = client.get("/api/receipts?start_date=2026-04-01&end_date=2026-04-30")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


def test_list_receipts_pagination(client, db):
    for i in range(5):
        make_receipt(db, f"마트{i}", "2026-04-01", 10000)

    resp = client.get("/api/receipts?page=1&limit=3")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 5
    assert len(body["items"]) == 3


# ---------------------------------------------------------------------------
# 상세 조회
# ---------------------------------------------------------------------------

def test_get_receipt_success(client, db):
    r = make_receipt(db)
    resp = client.get(f"/api/receipts/{r.id}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["store_name"] == "테스트마트"
    assert body["total_amount"] == 50000.0


def test_get_receipt_with_items(client, db):
    r = make_receipt(db)
    item = ReceiptItem(receipt_id=r.id, item_name="사과", quantity=2, unit_price=3000, total_price=6000)
    db.add(item)
    db.commit()

    resp = client.get(f"/api/receipts/{r.id}")
    assert resp.status_code == 200
    assert len(resp.json()["items"]) == 1
    assert resp.json()["items"][0]["item_name"] == "사과"


def test_get_receipt_not_found(client):
    resp = client.get("/api/receipts/999")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# 수정
# ---------------------------------------------------------------------------

def test_update_receipt(client, db):
    r = make_receipt(db)
    resp = client.put(f"/api/receipts/{r.id}", json={"store_name": "수정마트", "total_amount": 99000.0})
    assert resp.status_code == 200
    body = resp.json()
    assert body["store_name"] == "수정마트"
    assert body["total_amount"] == 99000.0


def test_update_receipt_not_found(client):
    resp = client.put("/api/receipts/999", json={"store_name": "없음"})
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# 삭제
# ---------------------------------------------------------------------------

def test_delete_receipt(client, db):
    r = make_receipt(db)
    resp = client.delete(f"/api/receipts/{r.id}")
    assert resp.status_code == 204

    resp = client.get(f"/api/receipts/{r.id}")
    assert resp.status_code == 404


def test_delete_receipt_not_found(client):
    resp = client.delete("/api/receipts/999")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# 업로드
# ---------------------------------------------------------------------------

def test_upload_invalid_extension(client):
    resp = client.post(
        "/api/receipts/upload",
        files={"file": ("test.txt", BytesIO(b"data"), "text/plain")},
    )
    assert resp.status_code == 400


def test_upload_file_too_large(client):
    big_content = b"\xff\xd8\xff" + b"\x00" * (10 * 1024 * 1024 + 1)
    resp = client.post(
        "/api/receipts/upload",
        files={"file": ("receipt.jpg", BytesIO(big_content), "image/jpeg")},
    )
    assert resp.status_code == 400


def test_upload_success(client, db):
    ocr_mock = {
        "store_name": "OCR마트",
        "date": "2026-04-01",
        "items": [{"name": "사과", "quantity": 2, "price": 3000.0}],
        "total": 6000.0,
        "category": "식료품",
    }

    with patch("app.routers.receipts.ocr_service.analyze_receipt", new=AsyncMock(return_value=ocr_mock)):
        resp = client.post(
            "/api/receipts/upload",
            files={"file": ("receipt.jpg", BytesIO(b"\xff\xd8\xff" + b"\x00" * 100), "image/jpeg")},
        )

    assert resp.status_code == 201
    body = resp.json()
    assert body["store_name"] == "OCR마트"
    assert body["total_amount"] == 6000.0
    assert len(body["items"]) == 1
    assert body["items"][0]["item_name"] == "사과"

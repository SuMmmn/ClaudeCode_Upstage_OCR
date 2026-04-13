"""영수증 CRUD 및 업로드 라우터."""

import json
from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.receipt import (
    ReceiptListResponse,
    ReceiptResponse,
    ReceiptUpdate,
    ReceiptCreate,
)
from app.schemas.receipt_item import ReceiptItemCreate
from app.services import ocr_service, receipt_service
from app.utils.file_utils import save_file, validate_file

router = APIRouter()


@router.post("/upload", response_model=ReceiptResponse, status_code=201)
async def upload_receipt(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """영수증 파일 업로드 → OCR 분석 → DB 저장."""
    content = await file.read()

    validate_file(file.filename or "", file.content_type or "", len(content))

    file_path = save_file(file.filename or "receipt", content)

    try:
        ocr_result = await ocr_service.analyze_receipt(file_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OCR 분석 실패: {exc}") from exc

    today = date.today().strftime("%Y-%m-%d")
    items = [
        ReceiptItemCreate(
            item_name=item.get("name", ""),
            quantity=int(item.get("quantity", 1)),
            unit_price=float(item.get("price", 0.0)),
            total_price=float(item.get("price", 0.0)) * int(item.get("quantity", 1)),
        )
        for item in ocr_result.get("items", [])
    ]

    receipt_data = ReceiptCreate(
        store_name=ocr_result.get("store_name", "알 수 없음"),
        date=ocr_result.get("date") or today,
        total_amount=float(ocr_result.get("total", 0.0)),
        category=ocr_result.get("category"),
        image_path=file_path,
        raw_json=json.dumps(ocr_result, ensure_ascii=False),
        items=items,
    )

    return receipt_service.create_receipt(db, receipt_data)


@router.get("", response_model=ReceiptListResponse)
async def list_receipts(
    start_date: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    category: str | None = Query(default=None),
    store_name: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """영수증 목록 조회 (날짜·카테고리·상호명 필터, 페이지네이션)."""
    receipts, total = receipt_service.list_receipts(
        db, start_date, end_date, category, store_name, page, limit
    )
    return ReceiptListResponse(total=total, page=page, limit=limit, items=receipts)


@router.get("/{receipt_id}", response_model=ReceiptResponse)
async def get_receipt(receipt_id: int, db: Session = Depends(get_db)):
    """영수증 상세 조회 (항목 목록 포함)."""
    return receipt_service.get_receipt_or_404(db, receipt_id)


@router.put("/{receipt_id}", response_model=ReceiptResponse)
async def update_receipt(
    receipt_id: int,
    data: ReceiptUpdate,
    db: Session = Depends(get_db),
):
    """영수증 정보 수정."""
    return receipt_service.update_receipt(db, receipt_id, data)


@router.delete("/{receipt_id}", status_code=204)
async def delete_receipt(receipt_id: int, db: Session = Depends(get_db)):
    """영수증 삭제 (항목 CASCADE 삭제)."""
    receipt_service.delete_receipt(db, receipt_id)

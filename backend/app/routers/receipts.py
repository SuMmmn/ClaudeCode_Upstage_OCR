"""영수증 CRUD 및 업로드 라우터."""

import json
from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.receipt import (
    ReceiptCreate,
    ReceiptListResponse,
    ReceiptResponse,
    ReceiptUpdate,
)
from app.schemas.receipt_item import ReceiptItemCreate
from app.services import ocr_service, receipt_service
from app.utils.file_utils import save_file, validate_file

router = APIRouter()

_404 = {"description": "영수증을 찾을 수 없음"}
_400 = {"description": "잘못된 요청 (파일 형식·크기 오류)"}
_500 = {"description": "OCR 분석 서버 오류"}


@router.post(
    "/upload",
    response_model=ReceiptResponse,
    status_code=201,
    summary="영수증 업로드 & OCR 분석",
    description=(
        "이미지(JPG, PNG) 또는 PDF 영수증을 업로드합니다.\n\n"
        "1. 파일 형식·크기(최대 10MB) 검증\n"
        "2. **Upstage Document Parse** API로 텍스트 추출\n"
        "3. **Solar LLM**이 구조화된 JSON으로 변환\n"
        "4. DB에 저장 후 영수증 상세 정보 반환\n\n"
        "> OCR 분석에 최대 10초가 소요될 수 있습니다."
    ),
    responses={400: _400, 422: {"description": "파일 MIME 타입 오류"}, 500: _500},
)
async def upload_receipt(
    file: UploadFile = File(..., description="업로드할 영수증 파일 (JPG·PNG·PDF, 최대 10MB)"),
    db: Session = Depends(get_db),
):
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
            item_name=item.get("name", "") or "항목",
            quantity=max(1, abs(int(item.get("quantity", 1)))),
            unit_price=abs(float(item.get("price", 0.0))),
            total_price=abs(float(item.get("price", 0.0))) * max(1, abs(int(item.get("quantity", 1)))),
        )
        for item in ocr_result.get("items", [])
        if item.get("name")
    ]

    receipt_data = ReceiptCreate(
        store_name=ocr_result.get("store_name", "알 수 없음"),
        date=ocr_result.get("date") or today,
        total_amount=abs(float(ocr_result.get("total", 0.0))),
        category=ocr_result.get("category"),
        image_path=file_path,
        raw_json=json.dumps(ocr_result, ensure_ascii=False),
        items=items,
    )

    return receipt_service.create_receipt(db, receipt_data)


@router.get(
    "",
    response_model=ReceiptListResponse,
    summary="영수증 목록 조회",
    description=(
        "등록된 영수증 목록을 조회합니다.\n\n"
        "- `start_date` / `end_date`: 날짜 범위 필터 (YYYY-MM-DD)\n"
        "- `category`: 카테고리 필터 (식료품·외식·쇼핑·교통·의료·문화·기타)\n"
        "- `store_name`: 상호명 부분 검색\n"
        "- 결과는 **날짜 내림차순**으로 정렬됩니다."
    ),
)
async def list_receipts(
    start_date: str | None = Query(
        default=None,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="조회 시작일 (YYYY-MM-DD)",
        examples=["2026-04-01"],
    ),
    end_date: str | None = Query(
        default=None,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="조회 종료일 (YYYY-MM-DD)",
        examples=["2026-04-30"],
    ),
    category: str | None = Query(
        default=None,
        description="카테고리 (식료품·외식·쇼핑·교통·의료·문화·기타)",
        examples=["외식"],
    ),
    store_name: str | None = Query(
        default=None,
        description="상호명 부분 검색",
        examples=["스타벅스"],
    ),
    page: int = Query(default=1, ge=1, description="페이지 번호"),
    limit: int = Query(default=20, ge=1, le=100, description="페이지당 항목 수 (최대 100)"),
    db: Session = Depends(get_db),
):
    receipts, total = receipt_service.list_receipts(
        db, start_date, end_date, category, store_name, page, limit
    )
    return ReceiptListResponse(total=total, page=page, limit=limit, items=receipts)


@router.get(
    "/{receipt_id}",
    response_model=ReceiptResponse,
    summary="영수증 상세 조회",
    description="영수증 ID로 상세 정보와 구매 항목 목록을 함께 조회합니다.",
    responses={404: _404},
)
async def get_receipt(
    receipt_id: int,
    db: Session = Depends(get_db),
):
    return receipt_service.get_receipt_or_404(db, receipt_id)


@router.put(
    "/{receipt_id}",
    response_model=ReceiptResponse,
    summary="영수증 수정",
    description=(
        "영수증 정보를 수정합니다.\n\n"
        "- 전송하지 않은 필드는 기존 값을 유지합니다.\n"
        "- `items` 필드를 전송하면 기존 항목이 **전체 교체**됩니다."
    ),
    responses={404: _404},
)
async def update_receipt(
    receipt_id: int,
    data: ReceiptUpdate,
    db: Session = Depends(get_db),
):
    return receipt_service.update_receipt(db, receipt_id, data)


@router.delete(
    "/{receipt_id}",
    status_code=204,
    summary="영수증 삭제",
    description="영수증과 연결된 항목을 CASCADE 삭제합니다. 업로드된 이미지 파일도 함께 삭제됩니다.",
    responses={404: _404},
)
async def delete_receipt(receipt_id: int, db: Session = Depends(get_db)):
    receipt_service.delete_receipt(db, receipt_id)

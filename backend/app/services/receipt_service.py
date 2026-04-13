"""영수증 CRUD 비즈니스 로직."""

import logging
import os
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.receipt import Receipt
from app.models.receipt_item import ReceiptItem
from app.schemas.receipt import ReceiptCreate, ReceiptUpdate

logger = logging.getLogger(__name__)


def get_receipt_or_404(db: Session, receipt_id: int) -> Receipt:
    receipt = db.get(Receipt, receipt_id)
    if not receipt:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="영수증을 찾을 수 없습니다.")
    return receipt


def create_receipt(db: Session, data: ReceiptCreate) -> Receipt:
    receipt = Receipt(
        store_name=data.store_name,
        date=data.date,
        total_amount=data.total_amount,
        category=data.category,
        image_path=data.image_path,
        raw_json=data.raw_json,
    )
    db.add(receipt)
    db.flush()  # id 확보 (commit 전)

    for item_data in data.items:
        db.add(ReceiptItem(
            receipt_id=receipt.id,
            item_name=item_data.item_name,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=item_data.total_price,
        ))

    db.commit()
    db.refresh(receipt)
    return receipt


def list_receipts(
    db: Session,
    start_date: str | None = None,
    end_date: str | None = None,
    category: str | None = None,
    store_name: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Receipt], int]:
    stmt = select(Receipt)

    if start_date:
        stmt = stmt.where(Receipt.date >= start_date)
    if end_date:
        stmt = stmt.where(Receipt.date <= end_date)
    if category:
        stmt = stmt.where(Receipt.category == category)
    if store_name:
        stmt = stmt.where(Receipt.store_name.contains(store_name))

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))

    stmt = stmt.order_by(Receipt.date.desc(), Receipt.id.desc())
    stmt = stmt.offset((page - 1) * limit).limit(limit)

    return list(db.scalars(stmt)), total or 0


def update_receipt(db: Session, receipt_id: int, data: ReceiptUpdate) -> Receipt:
    receipt = get_receipt_or_404(db, receipt_id)

    for field, value in data.model_dump(exclude_unset=True, exclude={"items"}).items():
        setattr(receipt, field, value)

    if data.items is not None:
        # 기존 항목 전체 교체
        for item in list(receipt.items):
            db.delete(item)
        db.flush()

        for item_data in data.items:
            db.add(ReceiptItem(
                receipt_id=receipt.id,
                item_name=item_data.item_name or "",
                quantity=item_data.quantity or 1,
                unit_price=item_data.unit_price or 0.0,
                total_price=item_data.total_price or 0.0,
            ))

    db.commit()
    db.refresh(receipt)
    return receipt


def delete_receipt(db: Session, receipt_id: int) -> None:
    receipt = get_receipt_or_404(db, receipt_id)
    image_path = receipt.image_path

    db.delete(receipt)
    db.commit()

    # DB 삭제 후 이미지 파일 동기 삭제
    if image_path and os.path.exists(image_path):
        try:
            os.remove(image_path)
        except OSError as e:
            # 파일 삭제 실패는 경고만 기록 (DB 삭제는 이미 완료)
            logger.warning("이미지 파일 삭제 실패: %s — %s", image_path, e)

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.receipt_item import ReceiptItemCreate, ReceiptItemResponse, ReceiptItemUpdate


class ReceiptBase(BaseModel):
    store_name: str = Field(..., description="상호명", examples=["스타벅스 강남점"])
    date: str = Field(
        ...,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="영수증 날짜 (YYYY-MM-DD)",
        examples=["2026-04-13"],
    )
    total_amount: float = Field(ge=0, description="합계 금액 (원)", examples=[9000.0])
    category: str | None = Field(
        default=None,
        description="지출 카테고리 (식료품·외식·쇼핑·교통·의료·문화·기타)",
        examples=["외식"],
    )


class ReceiptCreate(ReceiptBase):
    items: list[ReceiptItemCreate] = Field(default=[], description="구매 항목 목록")
    image_path: str | None = Field(default=None, description="저장된 이미지 경로")
    raw_json: str | None = Field(default=None, description="OCR 원본 JSON")


class ReceiptUpdate(BaseModel):
    store_name: str | None = Field(default=None, description="상호명", examples=["이마트 서초점"])
    date: str | None = Field(
        default=None,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="날짜 (YYYY-MM-DD)",
        examples=["2026-04-13"],
    )
    total_amount: float | None = Field(default=None, ge=0, description="합계 금액 (원)", examples=[15000.0])
    category: str | None = Field(default=None, description="카테고리", examples=["식료품"])
    items: list[ReceiptItemUpdate] | None = Field(default=None, description="구매 항목 (전체 교체)")


class ReceiptSummary(ReceiptBase):
    id: int = Field(..., description="영수증 ID", examples=[1])
    created_at: datetime = Field(..., description="등록 일시")

    model_config = {"from_attributes": True}


class ReceiptResponse(ReceiptSummary):
    image_path: str | None = Field(default=None, description="이미지 파일 경로")
    items: list[ReceiptItemResponse] = Field(default=[], description="구매 항목 목록")

    model_config = {"from_attributes": True}


class ReceiptListResponse(BaseModel):
    total: int = Field(..., description="전체 건수", examples=[42])
    page: int = Field(..., description="현재 페이지", examples=[1])
    limit: int = Field(..., description="페이지당 항목 수", examples=[20])
    items: list[ReceiptSummary] = Field(..., description="영수증 목록")

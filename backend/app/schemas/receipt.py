from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.receipt_item import ReceiptItemCreate, ReceiptItemResponse, ReceiptItemUpdate


class ReceiptBase(BaseModel):
    store_name: str
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    total_amount: float = Field(ge=0)
    category: str | None = None


class ReceiptCreate(ReceiptBase):
    items: list[ReceiptItemCreate] = []
    image_path: str | None = None
    raw_json: str | None = None


class ReceiptUpdate(BaseModel):
    store_name: str | None = None
    date: str | None = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    total_amount: float | None = Field(default=None, ge=0)
    category: str | None = None
    items: list[ReceiptItemUpdate] | None = None


class ReceiptSummary(ReceiptBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ReceiptResponse(ReceiptSummary):
    image_path: str | None = None
    items: list[ReceiptItemResponse] = []

    model_config = {"from_attributes": True}


class ReceiptListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: list[ReceiptSummary]

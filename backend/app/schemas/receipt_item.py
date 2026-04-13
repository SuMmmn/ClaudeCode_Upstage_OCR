from pydantic import BaseModel, Field


class ReceiptItemBase(BaseModel):
    item_name: str
    quantity: int = Field(default=1, ge=1)
    unit_price: float = Field(ge=0)
    total_price: float = Field(ge=0)


class ReceiptItemCreate(ReceiptItemBase):
    pass


class ReceiptItemUpdate(BaseModel):
    item_name: str | None = None
    quantity: int | None = Field(default=None, ge=1)
    unit_price: float | None = Field(default=None, ge=0)
    total_price: float | None = Field(default=None, ge=0)


class ReceiptItemResponse(ReceiptItemBase):
    id: int
    receipt_id: int

    model_config = {"from_attributes": True}

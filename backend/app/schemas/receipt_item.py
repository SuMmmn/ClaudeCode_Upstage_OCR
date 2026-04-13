from pydantic import BaseModel, Field


class ReceiptItemBase(BaseModel):
    item_name: str = Field(..., description="상품명", examples=["아메리카노 Tall"])
    quantity: int = Field(default=1, ge=1, description="수량", examples=[2])
    unit_price: float = Field(ge=0, description="단가 (원)", examples=[4500.0])
    total_price: float = Field(ge=0, description="합계 금액 (원)", examples=[9000.0])


class ReceiptItemCreate(ReceiptItemBase):
    pass


class ReceiptItemUpdate(BaseModel):
    item_name: str | None = Field(default=None, description="상품명")
    quantity: int | None = Field(default=None, ge=1, description="수량")
    unit_price: float | None = Field(default=None, ge=0, description="단가 (원)")
    total_price: float | None = Field(default=None, ge=0, description="합계 금액 (원)")


class ReceiptItemResponse(ReceiptItemBase):
    id: int = Field(..., description="항목 ID", examples=[1])
    receipt_id: int = Field(..., description="영수증 ID", examples=[1])

    model_config = {"from_attributes": True}

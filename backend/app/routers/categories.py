from fastapi import APIRouter

router = APIRouter()

CATEGORIES = ["식료품", "외식", "쇼핑", "교통", "의료", "문화", "기타"]


@router.get("")
async def list_categories():
    return {"categories": CATEGORIES}

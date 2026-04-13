from fastapi import APIRouter

router = APIRouter()

CATEGORIES = ["식료품", "외식", "쇼핑", "교통", "의료", "문화", "기타"]


@router.get(
    "",
    summary="카테고리 목록 조회",
    description="지출 카테고리 7개 고정 목록을 반환합니다.",
    response_description="카테고리 목록",
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": {"categories": ["식료품", "외식", "쇼핑", "교통", "의료", "문화", "기타"]}
                }
            }
        }
    },
)
async def list_categories():
    return {"categories": CATEGORIES}

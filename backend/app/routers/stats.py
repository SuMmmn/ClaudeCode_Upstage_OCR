from fastapi import APIRouter

router = APIRouter()


@router.get("/summary")
async def get_stats_summary():
    # Sprint 4에서 구현
    pass

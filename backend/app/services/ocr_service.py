"""Upstage Document Parse + Solar LLM으로 영수증을 분석하여 구조화된 JSON 반환."""

import asyncio
import json
import re
from datetime import date

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_upstage import ChatUpstage, UpstageDocumentParseLoader

from app.config import settings

CATEGORIES = ["식료품", "외식", "쇼핑", "교통", "의료", "문화", "기타"]

_SYSTEM_TEMPLATE = """오늘 날짜: {today}
영수증 텍스트를 분석하여 아래 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 출력하세요.

{{
  "store_name": "상호명 (인식 불가 시 '알 수 없음')",
  "date": "YYYY-MM-DD",
  "items": [
    {{"name": "상품명", "quantity": 1, "price": 0.0}}
  ],
  "total": 0.0,
  "category": "식료품|외식|쇼핑|교통|의료|문화|기타 중 하나"
}}

규칙:
- category는 반드시 위 7개 중 하나 선택
- date 미확인 시 오늘 날짜 사용
- 금액은 원화 기호 제거 후 숫자(float)만"""


def _parse_with_llm(text: str) -> dict:
    """Solar LLM으로 영수증 텍스트 → 구조화 JSON 변환."""
    today = date.today().strftime("%Y-%m-%d")
    llm = ChatUpstage(api_key=settings.upstage_api_key)

    messages = [
        SystemMessage(content=_SYSTEM_TEMPLATE.format(today=today)),
        HumanMessage(content=text),
    ]

    response = llm.invoke(messages)
    raw = response.content.strip()
    # 마크다운 코드블록 제거
    raw = re.sub(r"```(?:json)?\n?", "", raw).strip("` \n")

    data = json.loads(raw)

    # category 유효성 보정
    if data.get("category") not in CATEGORIES:
        data["category"] = "기타"

    # date 형식 보정
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", str(data.get("date", ""))):
        data["date"] = today

    # items 기본값 보정
    for item in data.get("items", []):
        item.setdefault("quantity", 1)
        item.setdefault("price", 0.0)

    return data


def _analyze_sync(file_path: str) -> dict:
    """Document Parse API로 텍스트 추출 후 LLM으로 파싱 (동기)."""
    loader = UpstageDocumentParseLoader(file_path, api_key=settings.upstage_api_key)
    docs = loader.load()
    combined_text = "\n".join(doc.page_content for doc in docs)
    return _parse_with_llm(combined_text)


async def analyze_receipt(file_path: str) -> dict:
    """
    영수증 이미지/PDF를 분석하여 구조화된 데이터를 반환합니다.

    Returns:
        {
            "store_name": str,
            "date": "YYYY-MM-DD",
            "items": [{"name": str, "quantity": int, "price": float}],
            "total": float,
            "category": str,
        }
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _analyze_sync, file_path)

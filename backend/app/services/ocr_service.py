"""Upstage Document Parse + Solar LLM으로 영수증을 분석하여 구조화된 JSON 반환."""

import asyncio
import json
import logging
import os
import re
from datetime import date

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_upstage import ChatUpstage, UpstageDocumentParseLoader

from app.config import settings

logger = logging.getLogger(__name__)

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

    try:
        response = llm.invoke(messages)
    except Exception as e:
        raise RuntimeError(f"Solar LLM 호출 실패: {e}") from e

    raw = response.content.strip()
    raw = re.sub(r"```(?:json)?\n?", "", raw).strip("` \n")

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error("LLM 응답 JSON 파싱 실패: %s\n원문: %s", e, raw[:200])
        raise ValueError(
            "OCR 결과를 파싱할 수 없습니다. 영수증 이미지가 선명한지 확인해 주세요."
        ) from e

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
    # 사전 검증
    if not settings.upstage_api_key:
        raise ValueError(
            "UPSTAGE_API_KEY가 설정되지 않았습니다. backend/.env 파일을 확인해 주세요."
        )
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"업로드 파일을 찾을 수 없습니다: {file_path}")

    # Document Parse
    try:
        loader = UpstageDocumentParseLoader(file_path, api_key=settings.upstage_api_key)
        docs = loader.load()
    except Exception as e:
        raise RuntimeError(f"Upstage Document Parse 호출 실패: {e}") from e

    combined_text = "\n".join(doc.page_content for doc in docs).strip()

    if not combined_text:
        raise ValueError(
            "영수증에서 텍스트를 추출할 수 없습니다. "
            "이미지가 선명한지, 지원 형식(JPG/PNG/PDF)인지 확인해 주세요."
        )

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

    Raises:
        ValueError: API 키 미설정, 텍스트 추출 불가, JSON 파싱 실패
        FileNotFoundError: 파일 없음
        RuntimeError: Upstage/LLM API 호출 오류
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _analyze_sync, file_path)

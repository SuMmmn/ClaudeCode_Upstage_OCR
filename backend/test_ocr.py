"""OCR 서비스 단독 테스트 스크립트.

사용법:
    python test_ocr.py <이미지_또는_PDF_경로>

예시:
    python test_ocr.py ../images/02_cu.jpg
"""

import asyncio
import json
import sys
from pathlib import Path


def main():
    if len(sys.argv) < 2:
        print("사용법: python test_ocr.py <파일경로>")
        sys.exit(1)

    file_path = sys.argv[1]

    if not Path(file_path).exists():
        print(f"파일을 찾을 수 없습니다: {file_path}")
        sys.exit(1)

    # 프로젝트 루트를 sys.path에 추가
    sys.path.insert(0, str(Path(__file__).parent))

    # backend/.env 명시적 로드 (pydantic-settings 경로 보완)
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")

    from app.services.ocr_service import analyze_receipt

    print(f"분석 중: {file_path}")
    print("-" * 40)

    result = asyncio.run(analyze_receipt(file_path))

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

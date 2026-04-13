# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**AI 영수증 지출 관리 시스템** — 영수증 이미지(JPG, PNG) 또는 PDF를 업로드하면 Upstage Vision LLM이 자동으로 내용을 OCR 분석하여 지출 항목을 구조화하고, 소비 패턴을 시각화하는 웹 애플리케이션.

- 기획 문서: `개요서_AI_영수증_지출관리.md`, `PRD_AI_영수증_지출관리.md`
- 샘플 영수증 이미지: `images/` 디렉터리

---

## 개발 명령어

### 백엔드 (`backend/`)

```bash
# 가상환경 생성 및 활성화
python -m venv venv
source venv/Scripts/activate   # Windows

# 의존성 설치
pip install -r requirements.txt

# 개발 서버 실행 (hot reload)
uvicorn app.main:app --reload --port 8000

# API 문서 확인
# http://localhost:8000/docs

# 전체 테스트 실행
pytest

# 특정 테스트 파일 실행
pytest tests/test_receipts.py -v

# 특정 테스트 케이스 실행
pytest tests/test_receipts.py::test_upload_receipt -v
```

### 프론트엔드 (`frontend/`)

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev       # http://localhost:5173

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린트 검사
npm run lint
```

---

## 아키텍처

### 전체 구조

```
claude_upstage_ocr/
├── backend/      # FastAPI (Python 3.11+)
└── frontend/     # React 18 + Vite 5 + TailwindCSS 3
```

### 백엔드 레이어 구조

```
routers/ → services/ → models(SQLAlchemy) → SQLite DB
                ↓
         ocr_service.py (LangChain + Upstage Vision LLM)
```

- **`routers/`** — FastAPI 엔드포인트만 정의. 비즈니스 로직은 `services/`에 위임
- **`services/ocr_service.py`** — Upstage API 호출 및 응답 JSON 파싱 담당
- **`services/receipt_service.py`** — 영수증 CRUD 및 파일 저장 로직
- **`schemas/`** — Pydantic 모델로 요청/응답 자동 검증
- **`database.py`** — `get_db()` 의존성 주입으로 모든 라우터에서 세션 공유
- **`config.py`** — `pydantic BaseSettings`로 환경변수 로딩

### 프론트엔드 레이어 구조

```
pages/ → hooks/ → api/(Axios) → FastAPI
           ↓
      components/
```

- **`pages/`** — 라우트 단위 페이지 컴포넌트 (데이터 패칭 로직은 `hooks/`에 위임)
- **`hooks/`** — API 호출·로딩·에러 상태를 캡슐화한 커스텀 훅
- **`api/`** — Axios 인스턴스 및 엔드포인트별 함수 모음
- **`components/charts/`** — Recharts 기반 차트 컴포넌트 (BarChart·PieChart·LineChart)
- **`store/ToastContext.jsx`** — 전역 토스트 알림 상태 관리

### 주요 API 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| `POST` | `/api/receipts/upload` | 파일 업로드 → OCR → DB 저장 |
| `GET`  | `/api/receipts` | 목록 조회 (날짜·카테고리·상호명 필터, 페이지네이션) |
| `GET`  | `/api/receipts/{id}` | 상세 조회 (영수증 + 항목 목록) |
| `PUT`  | `/api/receipts/{id}` | 수정 |
| `DELETE` | `/api/receipts/{id}` | 삭제 (CASCADE) |
| `GET`  | `/api/stats/summary` | 기간별/카테고리별 통계 |

---

## 환경변수

### 백엔드 (`backend/.env`)

```dotenv
UPSTAGE_API_KEY=your_upstage_api_key_here
DATABASE_URL=sqlite:///./data/receipts.db
UPLOAD_DIR=./uploads
```

### 프론트엔드 (`frontend/.env`)

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

---

## 데이터 모델

핵심 테이블 두 개로 구성되며, `receipt_items.receipt_id`는 `receipts.id`에 `ON DELETE CASCADE` 외래키.

- **`receipts`** — 영수증 헤더 (store_name, date, total_amount, category, image_path, raw_json)
- **`receipt_items`** — 영수증 항목 (item_name, quantity, unit_price, total_price)

OCR 결과 원본은 `receipts.raw_json`에 TEXT로 보존.

---

## 기술 스택 버전

| 영역 | 기술 | 버전 |
|------|------|------|
| BE | Python / FastAPI / SQLAlchemy / Pydantic | 3.11+ / 0.110+ / 2.0+ / 2.0+ |
| BE | LangChain / LangChain-Upstage | 1.2.15+ / 0.7.7+ |
| FE | React / Vite / TailwindCSS | 18+ / 5+ / 3+ |
| FE | Recharts / Axios / React Router | 2+ / 1.6+ / 6+ |
| FE | lucide-react (아이콘) | 최신 |

---

## 스타일 가이드 (프론트엔드)

- **폰트**: Pretendard (tailwind.config.js `fontFamily.sans` 우선 지정)
- **Primary 색상**: `blue-600` (`#2563EB`)
- **카드**: `bg-white rounded-xl shadow-sm border border-gray-200 p-6`
- **카테고리 배지**: `inline-flex ... rounded-full text-xs font-medium` + 카테고리별 색상 (PRD 13.2 참고)
- **아이콘 라이브러리**: `lucide-react`

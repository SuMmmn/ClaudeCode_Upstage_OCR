# AI 영수증 지출 관리

영수증 이미지(JPG, PNG) 또는 PDF를 업로드하면 **Upstage Vision LLM**이 자동으로 내용을 OCR 분석하여 지출 항목을 구조화하고 소비 패턴을 시각화하는 웹 애플리케이션입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | Python 3.11+, FastAPI, SQLAlchemy 2.0, SQLite |
| AI/OCR | LangChain, Upstage Document Parse, Solar LLM |
| 프론트엔드 | React 18, Vite, TailwindCSS, Recharts |

## 로컬 실행 가이드

### 사전 요구사항

- Python 3.11 이상
- Node.js 18 이상
- [Upstage API Key](https://console.upstage.ai)

---

### 백엔드

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/Scripts/activate      # Windows
# source venv/bin/activate         # macOS/Linux

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일에서 UPSTAGE_API_KEY 값을 실제 키로 교체

# 개발 서버 실행
uvicorn app.main:app --reload --port 8000
```

- API 서버: http://localhost:8000
- Swagger 문서: http://localhost:8000/docs

---

### 프론트엔드

```bash
cd frontend

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# 기본값(http://localhost:8000) 그대로 사용 가능

# 개발 서버 실행
npm run dev
```

- 애플리케이션: http://localhost:5173

---

## 환경변수

### `backend/.env`

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `UPSTAGE_API_KEY` | Upstage API 키 **(필수)** | — |
| `DATABASE_URL` | SQLite DB 경로 | `sqlite:///./data/receipts.db` |
| `UPLOAD_DIR` | 업로드 파일 저장 경로 | `./uploads` |

### `frontend/.env`

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_BASE_URL` | 백엔드 API 주소 | `http://localhost:8000` |

---

## 테스트

```bash
cd backend
source venv/Scripts/activate
pytest tests/ -v
```

현재 27개 테스트 포함 (영수증 CRUD 16개 + 통계 11개)

---

## 주요 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/receipts/upload` | 파일 업로드 → OCR → DB 저장 |
| `GET`  | `/api/receipts` | 목록 조회 (날짜·카테고리·상호명 필터) |
| `GET`  | `/api/receipts/{id}` | 상세 조회 |
| `PUT`  | `/api/receipts/{id}` | 수정 |
| `DELETE` | `/api/receipts/{id}` | 삭제 (이미지 파일 포함) |
| `GET`  | `/api/stats/summary` | 기간별 통계 집계 |
| `GET`  | `/api/categories` | 카테고리 목록 |

---

## Vercel 배포 (프론트엔드)

1. [Vercel](https://vercel.com)에서 `frontend/` 디렉토리를 루트로 프로젝트 생성
2. Environment Variables에 `VITE_API_BASE_URL`을 배포된 백엔드 URL로 설정
3. `main` 브랜치 push 시 자동 배포

> `frontend/vercel.json`에 SPA 라우팅 설정이 포함되어 있습니다.

---

## 프로젝트 구조

```
claude_upstage_ocr/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy ORM 모델
│   │   ├── routers/         # FastAPI 엔드포인트
│   │   ├── schemas/         # Pydantic 요청/응답 스키마
│   │   ├── services/        # 비즈니스 로직 (OCR, CRUD, 통계)
│   │   └── utils/           # 파일 검증/저장 유틸리티
│   └── tests/               # pytest 테스트
└── frontend/
    └── src/
        ├── api/             # Axios 인스턴스 및 엔드포인트
        ├── components/      # 재사용 컴포넌트 (charts, common, layout, receipt)
        ├── hooks/           # 커스텀 훅 (useReceipts, useStats 등)
        ├── pages/           # 라우트 페이지
        └── store/           # 전역 상태 (Toast)
```

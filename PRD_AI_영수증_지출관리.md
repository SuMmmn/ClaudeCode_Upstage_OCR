# PRD (Product Requirements Document)
## AI 영수증 지출 관리 시스템
### Receipt Intelligence & Expense Tracker

| 항목 | 내용 |
|------|------|
| 문서 버전 | v1.0.0 |
| 작성일 | 2026-04-13 |
| 상태 | 검토 중 |
| 참조 문서 | 개요서_AI_영수증_지출관리.md v1.0.0 |

---

## 목차

1. [목적 및 배경](#1-목적-및-배경)
2. [목표 및 성공 지표](#2-목표-및-성공-지표)
3. [사용자 페르소나](#3-사용자-페르소나)
4. [기능 요구사항](#4-기능-요구사항)
5. [비기능 요구사항](#5-비기능-요구사항)
6. [시스템 아키텍처 및 기술 스택](#6-시스템-아키텍처-및-기술-스택)
7. [데이터 모델](#7-데이터-모델)
8. [API 명세](#8-api-명세)
9. [UI/UX 요구사항](#9-uiux-요구사항)
10. [제약 조건 및 가정](#10-제약-조건-및-가정)
11. [출시 기준 (Definition of Done)](#11-출시-기준-definition-of-done)
12. [프로젝트 구조](#12-프로젝트-구조)
13. [화면 디자인 및 스타일 가이드](#13-화면-디자인-및-스타일-가이드)
14. [개발 일정 및 마일스톤](#14-개발-일정-및-마일스톤)
15. [향후 로드맵](#15-향후-로드맵)

---

## 1. 목적 및 배경

### 1.1 문제 정의

| 문제 | 영향 |
|------|------|
| 수기 가계부는 번거롭고 지속성이 낮다 | 사용자가 중도 포기하여 소비 추적 실패 |
| 기존 가계부 앱은 직접 입력 방식 | 반복 입력으로 인한 피로감 및 오입력 발생 |
| 영수증을 사진/PDF로 보관하지만 활용이 없다 | 데이터가 죽어있어 소비 분석 불가 |

### 1.2 솔루션 요약

영수증 이미지(JPG, PNG) 또는 PDF를 업로드하면 **Upstage Vision LLM**이 자동으로 내용을 인식하고, 구조화된 지출 데이터로 변환하여 저장·분석하는 웹 애플리케이션.

### 1.3 범위

| 구분 | 포함 | 제외 |
|------|------|------|
| 플랫폼 | 웹 브라우저 | 모바일 네이티브 앱 |
| 인증 | 미적용 (단일 사용자) | 다중 사용자 / JWT 인증 |
| 데이터베이스 | SQLite | PostgreSQL (향후 마이그레이션) |
| 파일 형식 | JPG, PNG, PDF | 기타 형식 |
| 배포 | 프론트엔드: Vercel | 백엔드 서버리스 전환 |

---

## 2. 목표 및 성공 지표

### 2.1 비즈니스 목표

- 영수증 기반 지출 입력 자동화로 사용자 입력 부담 제거
- AI OCR 활용으로 수기 입력 대비 오류율 최소화
- 시각화 차트를 통한 소비 패턴 인사이트 제공

### 2.2 핵심 성과 지표 (KPI)

| 지표 | 목표값 | 측정 방법 |
|------|--------|-----------|
| OCR 데이터 추출 정확도 | 날짜·상호명·합계 기준 90% 이상 | 샘플 영수증 테스트 |
| 영수증 업로드 → 결과 표시 응답 시간 | 10초 이내 | API 응답 시간 측정 |
| 지출 목록 페이지 로딩 시간 | 2초 이내 | Lighthouse 측정 |
| 핵심 기능 오류율 | 1% 미만 | 서버 에러 로그 |

---

## 3. 사용자 페르소나

### Persona A — 직장인 개인 가계부 관리자

| 항목 | 내용 |
|------|------|
| 이름 | 김민준 (가명) |
| 나이 | 30대 |
| 상황 | 매달 영수증을 모아두지만 정리할 시간이 없다 |
| 목표 | 매월 지출을 카테고리별로 파악하고 절약 포인트를 찾고 싶다 |
| 고충 | 앱에 일일이 입력하는 게 귀찮아서 중단한 경험이 있다 |
| 기대 | 영수증 사진만 찍으면 자동으로 정리되었으면 좋겠다 |

### Persona B — 소규모 자영업자

| 항목 | 내용 |
|------|------|
| 이름 | 이수진 (가명) |
| 나이 | 40대 |
| 상황 | 사업 관련 지출 영수증을 종이로 보관 중 |
| 목표 | 세금 신고 시 지출 내역을 빠르게 정리하고 싶다 |
| 고충 | 영수증을 분류하고 합산하는 데 많은 시간이 소요된다 |
| 기대 | PDF 영수증을 업로드하면 카테고리별로 자동 정리되길 원한다 |

---

## 4. 기능 요구사항

### 4.1 기능 우선순위 정의

| 우선순위 | 기준 |
|----------|------|
| **P0** | MVP 필수 — 없으면 제품이 동작하지 않음 |
| **P1** | 핵심 가치 — 출시 시 반드시 포함 |
| **P2** | 향상 기능 — 출시 이후 추가 가능 |

---

### 4.2 F-01. 영수증 업로드 및 OCR 분석 `P0`

#### 요구사항

| ID | 요구사항 | 우선순위 |
|----|---------|----------|
| F-01-01 | 사용자는 JPG, PNG, PDF 파일을 드래그앤드롭 또는 파일 선택으로 업로드할 수 있다 | P0 |
| F-01-02 | 업로드 전 파일 미리보기(썸네일)를 제공한다 | P1 |
| F-01-03 | 업로드된 파일은 Upstage Vision LLM을 통해 OCR 분석된다 | P0 |
| F-01-04 | OCR 분석 중 진행 상태를 로딩 인디케이터로 표시한다 | P1 |
| F-01-05 | OCR 결과로 날짜, 상호명, 항목명, 수량, 단가, 합계, 카테고리를 추출한다 | P0 |
| F-01-06 | 지원하지 않는 파일 형식 업로드 시 명확한 에러 메시지를 표시한다 | P1 |
| F-01-07 | 업로드 최대 파일 크기는 10MB로 제한한다 | P1 |

#### OCR 출력 JSON 스키마

```json
{
  "date": "YYYY-MM-DD",
  "store_name": "string",
  "items": [
    {
      "name": "string",
      "quantity": "integer",
      "price": "number"
    }
  ],
  "total": "number",
  "category": "string (식료품 | 외식 | 쇼핑 | 교통 | 의료 | 문화 | 기타)"
}
```

#### 인수 기준 (Acceptance Criteria)

- [ ] JPG, PNG, PDF 파일만 업로드 가능하며, 타 형식은 업로드 차단
- [ ] 파일 업로드 후 10초 이내에 OCR 분석 결과가 화면에 표시
- [ ] 추출된 항목이 지출 상세/수정 화면으로 자동 이동하여 확인 가능
- [ ] 10MB 초과 파일 업로드 시 에러 메시지 출력

---

### 4.3 F-02. 지출 데이터 저장 및 CRUD `P0`

#### 요구사항

| ID | 요구사항 | 우선순위 |
|----|---------|----------|
| F-02-01 | OCR 분석 결과를 SQLite DB에 자동 저장한다 | P0 |
| F-02-02 | 사용자는 AI 추출 결과를 수동으로 수정할 수 있다 | P1 |
| F-02-03 | 사용자는 저장된 영수증을 삭제할 수 있다 | P1 |
| F-02-04 | 영수증 삭제 시 관련 항목(receipt_items)도 함께 삭제한다 | P0 |
| F-02-05 | 원본 이미지는 서버에 저장하고 경로를 DB에 기록한다 | P1 |
| F-02-06 | LLM 출력 원본 JSON을 raw_json 컬럼에 보존한다 | P1 |

#### 인수 기준

- [ ] 분석 완료 후 영수증 및 항목 데이터가 DB에 정상 저장
- [ ] 저장된 데이터가 지출 내역 목록에 즉시 반영
- [ ] 수정 저장 후 목록과 상세 화면에 변경 내용이 반영
- [ ] 삭제 시 확인 다이얼로그 표시 후 처리

---

### 4.4 F-03. 지출 내역 조회 및 검색 `P0`

#### 요구사항

| ID | 요구사항 | 우선순위 |
|----|---------|----------|
| F-03-01 | 전체 영수증 목록을 최신순으로 조회할 수 있다 | P0 |
| F-03-02 | 날짜 범위(시작일~종료일)로 필터링할 수 있다 | P1 |
| F-03-03 | 카테고리별로 필터링할 수 있다 | P1 |
| F-03-04 | 상호명으로 검색할 수 있다 | P1 |
| F-03-05 | 목록은 페이지네이션(20건/페이지)을 적용한다 | P1 |
| F-03-06 | 특정 영수증 클릭 시 상세 화면으로 이동한다 | P0 |

#### 인수 기준

- [ ] 필터 조건 적용 시 조건에 맞는 결과만 표시
- [ ] 검색어 미입력 시 전체 목록 표시
- [ ] 20건 초과 데이터 존재 시 페이지네이션 컨트롤 표시

---

### 4.5 F-04. 지출 통계 시각화 `P1`

#### 요구사항

| ID | 요구사항 | 우선순위 |
|----|---------|----------|
| F-04-01 | 월별 지출 합계 막대 차트(BarChart)를 제공한다 | P1 |
| F-04-02 | 카테고리별 지출 비율 파이 차트(PieChart)를 제공한다 | P1 |
| F-04-03 | 일별 지출 추이 선 그래프(LineChart)를 제공한다 | P1 |
| F-04-04 | 통계 기간을 사용자가 직접 선택할 수 있다 | P1 |
| F-04-05 | 메인 대시보드에 최근 지출 요약을 표시한다 | P1 |
| F-04-06 | 차트 데이터가 없을 때 빈 상태(Empty State) UI를 표시한다 | P2 |

#### 인수 기준

- [ ] 차트는 Recharts 라이브러리를 사용하여 구현
- [ ] 기간 선택 변경 시 차트 데이터가 동적으로 갱신
- [ ] 카테고리 파이 차트에 범례(Legend) 및 비율(%) 표시

---

### 4.6 F-05. 영수증 이미지 관리 `P2`

#### 요구사항

| ID | 요구사항 | 우선순위 |
|----|---------|----------|
| F-05-01 | 업로드된 영수증 원본 이미지 썸네일을 목록에서 표시한다 | P2 |
| F-05-02 | 썸네일 클릭 시 원본 이미지를 모달로 확대 표시한다 | P2 |

---

## 5. 비기능 요구사항

### 5.1 성능

| 요구사항 | 목표 |
|----------|------|
| OCR 분석 API 응답 시간 | 10초 이내 (P95) |
| 지출 목록 API 응답 시간 | 500ms 이내 |
| 프론트엔드 초기 로딩 (LCP) | 2.5초 이내 |
| 동시 업로드 처리 | 단일 사용자 환경 기준 (다중 동시 요청 제한 없음) |

### 5.2 보안

| 요구사항 | 내용 |
|----------|------|
| API 키 관리 | `UPSTAGE_API_KEY`는 서버 환경변수로만 관리, 클라이언트 노출 금지 |
| 파일 업로드 검증 | 확장자 및 MIME 타입 이중 검증 |
| 업로드 용량 제한 | 요청당 최대 10MB |
| SQL Injection 방지 | ORM/파라미터 바인딩 사용, raw query 지양 |

### 5.3 가용성 및 운영

| 요구사항 | 내용 |
|----------|------|
| 배포 환경 | Vercel (프론트엔드 자동 CI/CD) |
| 환경변수 관리 | Vercel Dashboard에서 관리 |
| 브라우저 지원 | Chrome, Edge, Firefox 최신 버전 |
| 반응형 지원 | 데스크탑 우선, 태블릿 대응 |

### 5.4 유지보수성

- 백엔드: FastAPI 라우터 모듈화 (`routers/`, `services/`, `models/` 분리)
- 프론트엔드: React 컴포넌트 단위 분리, 재사용 가능한 UI 컴포넌트 설계
- API 자동 문서화: FastAPI Swagger UI (`/docs`) 유지

---

## 6. 시스템 아키텍처 및 기술 스택

### 6.1 전체 흐름

```
사용자 (Browser)
  │  ReactJS + Vite + TailwindCSS
  │  HTTP/HTTPS (Axios)
  ▼
백엔드 서버 (FastAPI / Python 3.11+)
  ├── POST /api/receipts/upload
  │     └── LangChain + Upstage Vision LLM → JSON 추출
  │     └── SQLite 저장
  ├── GET  /api/receipts
  ├── GET  /api/receipts/{id}
  ├── PUT  /api/receipts/{id}
  ├── DELETE /api/receipts/{id}
  └── GET  /api/stats/summary
  │
  ▼
SQLite DB (receipts, receipt_items)
```

### 6.2 기술 스택

#### 백엔드

| 기술 | 버전 | 역할 |
|------|------|------|
| Python | 3.11+ | 런타임 |
| FastAPI | 0.110+ | REST API 서버 |
| LangChain | 1.2.15+ | LLM 파이프라인 추상화 |
| LangChain Upstage | 0.7.7+ | Vision LLM OCR 연동 |
| SQLite | 내장 | 데이터 저장소 |
| SQLAlchemy | 2.0+ | ORM |
| Pydantic | 2.0+ | 데이터 검증 |

#### 프론트엔드

| 기술 | 버전 | 역할 |
|------|------|------|
| ReactJS | 18+ | UI 프레임워크 |
| Vite | 5+ | 빌드 도구 |
| TailwindCSS | 3+ | 스타일링 |
| Recharts | 2+ | 통계 차트 |
| Axios | 1.6+ | HTTP 클라이언트 |
| React Router | 6+ | 클라이언트 라우팅 |

#### 인프라

| 기술 | 역할 |
|------|------|
| Git | 버전 관리 |
| Vercel | 프론트엔드 CI/CD 배포 |

### 6.3 환경변수

| 변수명 | 설명 | 위치 |
|--------|------|------|
| `UPSTAGE_API_KEY` | Upstage API 인증 키 | 서버 환경변수 / Vercel Dashboard |
| `DATABASE_URL` | SQLite DB 파일 경로 | 서버 환경변수 |
| `UPLOAD_DIR` | 업로드 파일 저장 경로 | 서버 환경변수 |
| `VITE_API_BASE_URL` | 프론트엔드 API 기본 URL | `.env` (Vite) |

---

## 7. 데이터 모델

### 7.1 receipts (영수증 테이블)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | INTEGER | PK, AUTOINCREMENT | 영수증 고유 ID |
| `store_name` | TEXT | NOT NULL | 상호명 |
| `date` | DATE | NOT NULL | 구매 날짜 |
| `total_amount` | REAL | NOT NULL | 합계 금액 |
| `category` | TEXT | | 지출 카테고리 |
| `image_path` | TEXT | | 원본 이미지 저장 경로 |
| `raw_json` | TEXT | | LLM 출력 원본 JSON |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 레코드 생성 시각 |

### 7.2 receipt_items (지출 항목 테이블)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | INTEGER | PK, AUTOINCREMENT | 항목 고유 ID |
| `receipt_id` | INTEGER | FK → receipts.id ON DELETE CASCADE | 영수증 참조 ID |
| `item_name` | TEXT | NOT NULL | 상품명 |
| `quantity` | INTEGER | DEFAULT 1 | 수량 |
| `unit_price` | REAL | NOT NULL | 단가 |
| `total_price` | REAL | NOT NULL | 소계 (수량 × 단가) |

### 7.3 카테고리 목록

```
식료품 | 외식 | 쇼핑 | 교통 | 의료 | 문화 | 기타
```

---

## 8. API 명세

### 8.1 엔드포인트 목록

| Method | URL | 설명 | 우선순위 |
|--------|-----|------|----------|
| `POST` | `/api/receipts/upload` | 영수증 업로드 및 OCR 분석 후 저장 | P0 |
| `GET` | `/api/receipts` | 영수증 목록 조회 (필터/페이지 지원) | P0 |
| `GET` | `/api/receipts/{id}` | 영수증 상세 및 항목 조회 | P0 |
| `PUT` | `/api/receipts/{id}` | 영수증 정보 수동 수정 | P1 |
| `DELETE` | `/api/receipts/{id}` | 영수증 및 관련 항목 삭제 | P1 |
| `GET` | `/api/stats/summary` | 기간별/카테고리별 지출 통계 | P1 |
| `GET` | `/api/categories` | 사용 가능한 카테고리 목록 | P1 |

---

### 8.2 POST `/api/receipts/upload`

**Request**

- Content-Type: `multipart/form-data`
- Body: `file` (UploadFile) — JPG, PNG, PDF

**Response 200**

```json
{
  "receipt_id": 1,
  "store_name": "이마트 강남점",
  "date": "2025-04-10",
  "total_amount": 8900,
  "category": "식료품",
  "items": [
    { "id": 1, "item_name": "우유 1L", "quantity": 2, "unit_price": 3200, "total_price": 6400 },
    { "id": 2, "item_name": "식빵",   "quantity": 1, "unit_price": 2500, "total_price": 2500 }
  ]
}
```

**Response 400** — 지원하지 않는 파일 형식

```json
{ "detail": "지원하지 않는 파일 형식입니다. JPG, PNG, PDF만 허용됩니다." }
```

**Response 422** — 파일 크기 초과

```json
{ "detail": "파일 크기가 10MB를 초과합니다." }
```

---

### 8.3 GET `/api/receipts`

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `page` | integer | N | 1 | 페이지 번호 |
| `limit` | integer | N | 20 | 페이지당 항목 수 |
| `start_date` | date | N | - | 조회 시작일 (YYYY-MM-DD) |
| `end_date` | date | N | - | 조회 종료일 (YYYY-MM-DD) |
| `category` | string | N | - | 카테고리 필터 |
| `store_name` | string | N | - | 상호명 검색 (부분 일치) |

**Response 200**

```json
{
  "total": 42,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "id": 1,
      "store_name": "이마트 강남점",
      "date": "2025-04-10",
      "total_amount": 8900,
      "category": "식료품",
      "created_at": "2025-04-10T14:30:00"
    }
  ]
}
```

---

### 8.4 GET `/api/stats/summary`

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `start_date` | date | Y | 통계 시작일 |
| `end_date` | date | Y | 통계 종료일 |

**Response 200**

```json
{
  "total_amount": 250000,
  "by_category": [
    { "category": "식료품", "amount": 120000, "ratio": 48.0 },
    { "category": "외식",   "amount": 80000,  "ratio": 32.0 }
  ],
  "by_month": [
    { "month": "2025-03", "amount": 180000 },
    { "month": "2025-04", "amount": 70000 }
  ],
  "by_day": [
    { "date": "2025-04-10", "amount": 8900 }
  ]
}
```

---

## 9. UI/UX 요구사항

### 9.1 화면 목록

| No. | 화면명 | 경로 | 우선순위 |
|:---:|--------|------|----------|
| 1 | 메인 대시보드 | `/` | P0 |
| 2 | 영수증 업로드 | `/upload` | P0 |
| 3 | 지출 내역 목록 | `/expenses` | P0 |
| 4 | 지출 상세/수정 | `/expenses/{id}` | P0 |
| 5 | 통계 분석 | `/stats` | P1 |

### 9.2 화면별 요구사항

#### 화면 1 — 메인 대시보드 (`/`)

| 요소 | 내용 |
|------|------|
| 이번 달 지출 합계 | 상단 카드 UI로 표시 |
| 월별 지출 막대 차트 | 최근 6개월 |
| 카테고리 파이 차트 | 이번 달 기준 |
| 최근 지출 목록 | 최신 5건, 영수증 목록으로 이동 링크 포함 |
| 영수증 업로드 버튼 | CTA 버튼 — 업로드 화면으로 이동 |

#### 화면 2 — 영수증 업로드 (`/upload`)

| 요소 | 내용 |
|------|------|
| 드래그앤드롭 영역 | 파일 드롭 또는 클릭으로 파일 선택 |
| 파일 미리보기 | 선택된 이미지 썸네일 표시 |
| 분석 진행바 | 업로드 → 분석 중 → 완료 단계 표시 |
| 에러 메시지 | 파일 형식/크기 오류 인라인 표시 |
| 분석 완료 | 자동으로 지출 상세/수정 화면(`/expenses/{id}`)으로 이동 |

#### 화면 3 — 지출 내역 목록 (`/expenses`)

| 요소 | 내용 |
|------|------|
| 검색/필터 바 | 날짜 범위, 카테고리, 상호명 검색 |
| 지출 테이블 | 날짜, 상호명, 카테고리, 합계, 액션(상세/삭제) |
| 페이지네이션 | 20건/페이지, 이전/다음/페이지 번호 |
| 빈 상태 | 검색 결과 없음 메시지 |

#### 화면 4 — 지출 상세/수정 (`/expenses/{id}`)

| 요소 | 내용 |
|------|------|
| 영수증 이미지 뷰어 | 원본 이미지 표시, 클릭 시 모달 확대 |
| AI 추출 결과 표시 | 날짜, 상호명, 카테고리, 합계 |
| 항목 편집 폼 | 항목명, 수량, 단가 수정 가능한 인라인 편집 |
| 저장 / 취소 버튼 | 수정 후 저장 또는 원래 값으로 되돌리기 |
| 삭제 버튼 | 확인 다이얼로그 후 삭제 처리 |

#### 화면 5 — 통계 분석 (`/stats`)

| 요소 | 내용 |
|------|------|
| 기간 선택기 | 월 단위 또는 직접 날짜 범위 선택 |
| BarChart | 월별 지출 합계 |
| PieChart | 카테고리별 비율 (범례 + % 표시) |
| LineChart | 일별 지출 추이 |

### 9.3 공통 UI 가이드라인

| 항목 | 내용 |
|------|------|
| 색상 시스템 | TailwindCSS 기본 팔레트 활용, Primary: `blue-600` |
| 반응형 | 데스크탑(1280px+) 우선, 태블릿(768px) 대응 |
| 로딩 상태 | Skeleton UI 또는 Spinner 사용 |
| 에러 상태 | Toast 알림 또는 인라인 에러 메시지 |
| 빈 상태 | 일러스트 + 안내 문구 + CTA 버튼 |
| 접근성 | `alt` 속성, 키보드 네비게이션 기본 지원 |

---

## 10. 제약 조건 및 가정

### 10.1 기술 제약

| 제약 | 내용 |
|------|------|
| Upstage API 의존 | OCR 기능이 외부 API에 의존하므로 API 장애 시 분석 불가 |
| SQLite 단일 접속 | 다중 동시 쓰기 요청 시 성능 저하 가능 (단일 사용자 환경 전제) |
| 이미지 저장소 | 서버 로컬 파일시스템 저장 — 서버 재시작 시 파일 유지 필요 |

### 10.2 가정

- 초기 버전은 단일 사용자 환경을 전제로 하며 인증/인가를 구현하지 않는다.
- 영수증 이미지는 한국어로 작성된 것을 주요 대상으로 한다.
- OCR 정확도는 이미지 품질에 따라 달라질 수 있으며, 수동 수정 기능으로 보완한다.
- 백엔드 서버는 별도의 클라우드 환경(로컬 또는 독립 서버)에서 실행된다.

---

## 11. 출시 기준 (Definition of Done)

### MVP 출시 체크리스트

#### 기능

- [ ] 영수증 이미지/PDF 업로드 및 Upstage OCR 분석 동작
- [ ] 분석 결과 DB 저장 및 목록 조회 동작
- [ ] 영수증 상세 조회 및 수동 수정 동작
- [ ] 영수증 삭제 동작
- [ ] 메인 대시보드 차트 표시 (BarChart, PieChart)
- [ ] 지출 내역 필터/검색 동작

#### 품질

- [ ] 핵심 API 엔드포인트 단위 테스트 작성
- [ ] 파일 형식/크기 검증 동작 확인
- [ ] OCR 분석 실패 시 에러 처리 동작 확인
- [ ] FastAPI Swagger 문서 (`/docs`) 정상 렌더링

#### 배포

- [ ] Vercel 프론트엔드 자동 배포 설정 완료
- [ ] 환경변수 (`UPSTAGE_API_KEY`) Vercel Dashboard 등록
- [ ] `.env.example` 파일 제공

---

## 12. 프로젝트 구조

### 12.1 전체 디렉터리 구조

```
claude_upstage_ocr/                     # 프로젝트 루트
├── backend/                            # FastAPI 백엔드
├── frontend/                           # React 프론트엔드
├── .gitignore
└── README.md
```

---

### 12.2 백엔드 구조 (`backend/`)

```
backend/
├── app/
│   ├── main.py                         # FastAPI 앱 진입점, CORS 설정
│   ├── config.py                       # 환경변수 로딩 (pydantic BaseSettings)
│   ├── database.py                     # SQLAlchemy 엔진, 세션 설정
│   │
│   ├── models/                         # SQLAlchemy ORM 모델
│   │   ├── __init__.py
│   │   ├── receipt.py                  # receipts 테이블 모델
│   │   └── receipt_item.py             # receipt_items 테이블 모델
│   │
│   ├── schemas/                        # Pydantic 요청/응답 스키마
│   │   ├── __init__.py
│   │   ├── receipt.py                  # ReceiptCreate, ReceiptResponse 등
│   │   ├── receipt_item.py             # ReceiptItemCreate, ReceiptItemResponse
│   │   └── stats.py                    # StatsSummaryResponse
│   │
│   ├── routers/                        # FastAPI 라우터 (엔드포인트 정의)
│   │   ├── __init__.py
│   │   ├── receipts.py                 # /api/receipts 엔드포인트
│   │   ├── stats.py                    # /api/stats 엔드포인트
│   │   └── categories.py              # /api/categories 엔드포인트
│   │
│   ├── services/                       # 비즈니스 로직 레이어
│   │   ├── __init__.py
│   │   ├── ocr_service.py              # Upstage Vision LLM OCR 처리
│   │   ├── receipt_service.py          # 영수증 CRUD 비즈니스 로직
│   │   └── stats_service.py            # 통계 집계 로직
│   │
│   └── utils/
│       ├── __init__.py
│       └── file_utils.py               # 파일 저장/검증 유틸리티
│
├── uploads/                            # 업로드된 영수증 원본 이미지 저장소
├── data/
│   └── receipts.db                     # SQLite 데이터베이스 파일
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                     # pytest fixture (테스트 DB, 클라이언트)
│   ├── test_receipts.py                # 영수증 API 테스트
│   ├── test_stats.py                   # 통계 API 테스트
│   └── test_ocr_service.py             # OCR 서비스 단위 테스트
│
├── .env                                # 환경변수 (git 제외)
├── .env.example                        # 환경변수 예시 템플릿
├── requirements.txt                    # Python 의존성 패키지
└── README.md
```

#### 핵심 파일 역할

| 파일 | 역할 |
|------|------|
| `app/main.py` | FastAPI 인스턴스 생성, 라우터 등록, CORS 미들웨어 설정 |
| `app/config.py` | `UPSTAGE_API_KEY`, `DATABASE_URL`, `UPLOAD_DIR` 환경변수 관리 |
| `app/database.py` | SQLAlchemy 세션 팩토리, `get_db()` 의존성 주입 함수 |
| `app/services/ocr_service.py` | LangChain + Upstage Vision LLM 호출 및 JSON 파싱 |
| `app/routers/receipts.py` | 업로드, 목록, 상세, 수정, 삭제 엔드포인트 정의 |

#### `.env.example`

```dotenv
UPSTAGE_API_KEY=your_upstage_api_key_here
DATABASE_URL=sqlite:///./data/receipts.db
UPLOAD_DIR=./uploads
```

---

### 12.3 프론트엔드 구조 (`frontend/`)

```
frontend/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.jsx                        # React 앱 진입점
│   ├── App.jsx                         # 라우팅 설정 (React Router)
│   │
│   ├── pages/                          # 라우트별 페이지 컴포넌트
│   │   ├── Dashboard.jsx               # 메인 대시보드 (/)
│   │   ├── Upload.jsx                  # 영수증 업로드 (/upload)
│   │   ├── ExpenseList.jsx             # 지출 내역 목록 (/expenses)
│   │   ├── ExpenseDetail.jsx           # 지출 상세/수정 (/expenses/:id)
│   │   └── Stats.jsx                   # 통계 분석 (/stats)
│   │
│   ├── components/                     # 재사용 UI 컴포넌트
│   │   ├── layout/
│   │   │   ├── Header.jsx              # 상단 네비게이션 바
│   │   │   └── Sidebar.jsx             # 사이드 메뉴
│   │   │
│   │   ├── receipt/
│   │   │   ├── DropZone.jsx            # 드래그앤드롭 파일 업로드 영역
│   │   │   ├── ReceiptCard.jsx         # 영수증 목록 카드 아이템
│   │   │   ├── ReceiptTable.jsx        # 지출 내역 테이블
│   │   │   ├── ReceiptForm.jsx         # 영수증 정보 수정 폼
│   │   │   └── ItemEditor.jsx          # 항목별 인라인 편집 컴포넌트
│   │   │
│   │   ├── charts/
│   │   │   ├── MonthlyBarChart.jsx     # 월별 지출 막대 차트
│   │   │   ├── CategoryPieChart.jsx    # 카테고리별 파이 차트
│   │   │   └── DailyLineChart.jsx      # 일별 추이 선 그래프
│   │   │
│   │   └── common/
│   │       ├── Pagination.jsx          # 페이지네이션 컨트롤
│   │       ├── FilterBar.jsx           # 검색/필터 바
│   │       ├── Modal.jsx               # 공통 모달 (이미지 확대 등)
│   │       ├── LoadingSpinner.jsx      # 로딩 스피너
│   │       ├── Toast.jsx               # 토스트 알림
│   │       └── EmptyState.jsx          # 빈 상태 UI
│   │
│   ├── api/                            # Axios API 호출 모듈
│   │   ├── axiosInstance.js            # Axios 기본 설정 (baseURL, 인터셉터)
│   │   ├── receipts.js                 # 영수증 관련 API 함수
│   │   └── stats.js                    # 통계 관련 API 함수
│   │
│   ├── hooks/                          # 커스텀 React 훅
│   │   ├── useReceipts.js              # 영수증 목록 조회 훅
│   │   ├── useReceiptDetail.js         # 영수증 상세 조회/수정 훅
│   │   └── useStats.js                 # 통계 데이터 조회 훅
│   │
│   ├── store/                          # 전역 상태 관리 (Context API)
│   │   └── ToastContext.jsx            # 토스트 알림 전역 상태
│   │
│   └── constants/
│       └── categories.js               # 카테고리 목록 상수
│
├── .env                                # Vite 환경변수 (git 제외)
├── .env.example                        # 환경변수 예시
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

#### 핵심 파일 역할

| 파일 | 역할 |
|------|------|
| `src/App.jsx` | React Router 라우팅 테이블 정의 |
| `src/api/axiosInstance.js` | `VITE_API_BASE_URL` 기반 Axios 인스턴스, 에러 인터셉터 |
| `src/pages/Upload.jsx` | 파일 업로드, OCR 분석 진행, 결과 리다이렉트 |
| `src/components/receipt/DropZone.jsx` | 드래그앤드롭 + 파일 검증 (형식, 크기) |
| `src/components/charts/` | Recharts 기반 통계 차트 컴포넌트 |
| `src/hooks/` | API 호출·로딩·에러 상태를 캡슐화한 커스텀 훅 |

#### `.env.example`

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

---

### 12.4 레이어 의존 관계

```
[pages]
   │  상태/데이터 요청
   ▼
[hooks]  ←──────────────────────────────────
   │  API 호출                              │
   ▼                                        │ 상태 구독
[api/]                               [store/]
   │  HTTP 요청
   ▼
[axiosInstance.js]
   │
   ▼  HTTP
[FastAPI routers]
   │  비즈니스 로직 위임
   ▼
[services]
   │                    │
   ▼                    ▼
[Upstage LLM]       [SQLAlchemy models]
                         │
                         ▼
                     [SQLite DB]
```

---

### 12.5 주요 환경변수 요약

| 변수명 | 위치 | 설명 |
|--------|------|------|
| `UPSTAGE_API_KEY` | `backend/.env` | Upstage API 인증 키 (절대 커밋 금지) |
| `DATABASE_URL` | `backend/.env` | SQLite DB 파일 경로 |
| `UPLOAD_DIR` | `backend/.env` | 영수증 이미지 저장 디렉터리 |
| `VITE_API_BASE_URL` | `frontend/.env` | 백엔드 API 서버 주소 |

---

## 13. 화면 디자인 및 스타일 가이드

### 13.1 디자인 원칙

| 원칙 | 설명 |
|------|------|
| **명료함 (Clarity)** | 지출 데이터와 수치가 한눈에 읽히도록 여백과 타이포그래피를 충분히 활용 |
| **일관성 (Consistency)** | 모든 화면에서 동일한 컴포넌트·색상·간격 시스템을 사용 |
| **효율성 (Efficiency)** | 핵심 동작(업로드·조회)을 최소 클릭으로 수행할 수 있도록 구성 |
| **신뢰감 (Trust)** | 금융 데이터 특성상 차분한 색상 팔레트와 명확한 수치 표시로 신뢰감 부여 |

---

### 13.2 컬러 시스템

TailwindCSS 유틸리티 클래스를 기준으로 정의합니다.

#### 기본 팔레트

| 역할 | 색상명 | Tailwind 클래스 | Hex | 사용처 |
|------|--------|----------------|-----|--------|
| Primary | Blue 600 | `bg-blue-600` | `#2563EB` | 주요 버튼, 활성 메뉴, 링크 |
| Primary Hover | Blue 700 | `hover:bg-blue-700` | `#1D4ED8` | 버튼 호버 상태 |
| Primary Light | Blue 50 | `bg-blue-50` | `#EFF6FF` | 카드 배경 강조, 선택 행 |
| Success | Emerald 500 | `text-emerald-500` | `#10B981` | 저장 완료, 분석 성공 |
| Warning | Amber 500 | `text-amber-500` | `#F59E0B` | 예산 초과 경고, 주의 메시지 |
| Danger | Red 500 | `text-red-500` | `#EF4444` | 삭제 버튼, 에러 메시지 |
| Neutral Dark | Gray 900 | `text-gray-900` | `#111827` | 본문 제목 텍스트 |
| Neutral Mid | Gray 500 | `text-gray-500` | `#6B7280` | 보조 텍스트, 레이블 |
| Neutral Light | Gray 100 | `bg-gray-100` | `#F3F4F6` | 페이지 배경, 비활성 영역 |
| Border | Gray 200 | `border-gray-200` | `#E5E7EB` | 카드·테이블 테두리 |
| White | White | `bg-white` | `#FFFFFF` | 카드·모달 배경 |

#### 카테고리 색상

차트 및 카테고리 뱃지에 일관되게 적용합니다.

| 카테고리 | Tailwind 클래스 | Hex |
|----------|----------------|-----|
| 식료품 | `bg-green-100 text-green-700` | `#D1FAE5` / `#047857` |
| 외식 | `bg-orange-100 text-orange-700` | `#FFEDD5` / `#C2410C` |
| 쇼핑 | `bg-purple-100 text-purple-700` | `#EDE9FE` / `#6D28D9` |
| 교통 | `bg-blue-100 text-blue-700` | `#DBEAFE` / `#1D4ED8` |
| 의료 | `bg-red-100 text-red-700` | `#FEE2E2` / `#B91C1C` |
| 문화 | `bg-yellow-100 text-yellow-700` | `#FEF9C3` / `#A16207` |
| 기타 | `bg-gray-100 text-gray-600` | `#F3F4F6` / `#4B5563` |

---

### 13.3 타이포그래피

TailwindCSS 기본 폰트 스택을 사용하며, 한국어 가독성을 위해 `font-sans`에 `Pretendard`를 우선 지정합니다.

```js
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      sans: ['Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  },
}
```

#### 텍스트 스케일

| 역할 | 클래스 | 크기 | 굵기 | 사용처 |
|------|--------|------|------|--------|
| Page Title | `text-2xl font-bold` | 24px | 700 | 각 페이지 상단 제목 |
| Section Title | `text-xl font-semibold` | 20px | 600 | 카드·섹션 제목 |
| Card Title | `text-base font-semibold` | 16px | 600 | 카드 내 소제목 |
| Body | `text-sm text-gray-700` | 14px | 400 | 본문, 테이블 셀 |
| Caption | `text-xs text-gray-500` | 12px | 400 | 보조 정보, 날짜, 메타 |
| Amount | `text-lg font-bold` | 18px | 700 | 금액 수치 강조 표시 |
| Button | `text-sm font-medium` | 14px | 500 | 버튼 레이블 |

---

### 13.4 간격 및 레이아웃 시스템

#### 기본 간격 단위

Tailwind 4px 기반 스케일을 사용합니다.

| 용도 | 클래스 | 크기 |
|------|--------|------|
| 컴포넌트 내부 패딩 (소) | `p-3` | 12px |
| 컴포넌트 내부 패딩 (중) | `p-4` | 16px |
| 컴포넌트 내부 패딩 (대) | `p-6` | 24px |
| 카드 간 간격 | `gap-4` | 16px |
| 섹션 간 간격 | `mb-8` | 32px |
| 페이지 최대 너비 | `max-w-7xl mx-auto` | 1280px |
| 페이지 좌우 패딩 | `px-4 sm:px-6 lg:px-8` | 반응형 |

#### 레이아웃 골격

```
┌──────────────────────────────────────────────┐
│  Header  (h-16, bg-white, border-b)          │
├─────────────┬────────────────────────────────┤
│             │                                │
│  Sidebar    │   Main Content Area            │
│  (w-64)     │   (flex-1, bg-gray-100, p-8)  │
│  bg-white   │                                │
│  border-r   │   ┌──────────────────────┐     │
│             │   │  Page Title          │     │
│  Nav Items  │   ├──────────────────────┤     │
│  (py-2 px-4)│   │  Content Cards       │     │
│             │   │  (bg-white rounded-xl│     │
│             │   │   shadow-sm p-6)     │     │
│             │   └──────────────────────┘     │
└─────────────┴────────────────────────────────┘
```

---

### 13.5 공통 컴포넌트 스타일

#### 버튼

| 종류 | Tailwind 클래스 | 사용처 |
|------|----------------|--------|
| Primary | `bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors` | 저장, 업로드, 확인 |
| Secondary | `bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 transition-colors` | 취소, 돌아가기 |
| Danger | `bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors` | 삭제 |
| Icon Button | `p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors` | 편집, 삭제 아이콘 |

#### 카드

```
bg-white rounded-xl shadow-sm border border-gray-200 p-6
```

#### 입력 필드

```
w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
placeholder:text-gray-400
```

#### 배지 (카테고리 태그)

```
inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
```

예: 식료품 → `bg-green-100 text-green-700`

#### 테이블

```
/* 테이블 래퍼 */
overflow-hidden rounded-xl border border-gray-200

/* 헤더 행 */
bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3

/* 데이터 행 */
bg-white border-t border-gray-100 px-6 py-4 text-sm text-gray-700
hover:bg-blue-50 cursor-pointer transition-colors
```

#### 토스트 알림

| 종류 | 클래스 |
|------|--------|
| Success | `bg-emerald-50 border border-emerald-200 text-emerald-800` |
| Error | `bg-red-50 border border-red-200 text-red-800` |
| Info | `bg-blue-50 border border-blue-200 text-blue-800` |

- 위치: 화면 우측 하단 (`fixed bottom-4 right-4`)
- 자동 닫힘: 3초 후

---

### 13.6 화면별 와이어프레임

#### 화면 1 — 메인 대시보드 (`/`)

```
┌─────────────────────────────────────────────────────────┐
│  Header: "AI 영수증 지출 관리"          [+ 영수증 업로드] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ 이번달 지출  │ │ 지출 건수   │ │ 주요 카테고리│       │
│  │  ₩ 320,000  │ │    12건     │ │   식료품    │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  ┌──────────────────────────┐ ┌─────────────────┐       │
│  │  월별 지출 (BarChart)    │ │ 카테고리 (Pie)  │       │
│  │  [6개월 막대 그래프]     │ │  [파이 차트]    │       │
│  └──────────────────────────┘ └─────────────────┘       │
│                                                         │
│  최근 지출 내역                          [전체 보기 →]   │
│  ┌─────────────────────────────────────────────────┐    │
│  │  날짜      상호명          카테고리    금액       │    │
│  │  04-10    이마트 강남점    식료품    ₩ 8,900     │    │
│  │  04-09    스타벅스         외식      ₩ 6,500     │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

#### 화면 2 — 영수증 업로드 (`/upload`)

```
┌─────────────────────────────────────────────────────────┐
│  < 돌아가기    영수증 업로드                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │   📄  파일을 여기에 드래그하거나                 │    │
│  │       클릭하여 업로드하세요                     │    │
│  │                                                 │    │
│  │   JPG, PNG, PDF · 최대 10MB                    │    │
│  │                                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  [파일 선택 후]                                          │
│  ┌──────────┐                                           │
│  │ 미리보기  │  receipt_0410.jpg                        │
│  │ [썸네일] │  1.2 MB · JPG                            │
│  └──────────┘  [파일 변경]                              │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━  AI 분석 중... 67%          │
│                                                         │
│                            [분석 시작] (비활성/진행중)  │
└─────────────────────────────────────────────────────────┘
```

---

#### 화면 3 — 지출 내역 목록 (`/expenses`)

```
┌─────────────────────────────────────────────────────────┐
│  지출 내역                              [+ 영수증 업로드] │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────────┐ │
│  │ 2025-04-01│ │2025-04-30│ │카테고리 ▼│상호명 검색   🔍│ │
│  └──────────┘ └──────────┘ └──────────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  날짜 ↕    상호명 ↕      카테고리    금액 ↕  액션 │    │
│  ├─────────────────────────────────────────────────┤    │
│  │  04-10   이마트 강남점  [식료품]  ₩8,900  ✏️ 🗑  │    │
│  │  04-09   스타벅스       [외식]    ₩6,500  ✏️ 🗑  │    │
│  │  04-08   GS25           [식료품]  ₩3,200  ✏️ 🗑  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│              [< 이전]  1  2  3  [다음 >]                │
└─────────────────────────────────────────────────────────┘
```

---

#### 화면 4 — 지출 상세/수정 (`/expenses/:id`)

```
┌─────────────────────────────────────────────────────────┐
│  < 목록으로                         [수정 저장] [삭제]   │
├───────────────────────┬─────────────────────────────────┤
│                       │  상호명   이마트 강남점          │
│   [영수증 이미지]      │  날짜     2025-04-10            │
│                       │  카테고리 [식료품         ▼]    │
│   (클릭 시 모달 확대)  │  합계     ₩ 8,900               │
│                       ├─────────────────────────────────┤
│                       │  상품 항목                      │
│                       │  ┌──────────┬────┬──────┬──────┐│
│                       │  │ 상품명   │수량│ 단가 │ 소계 ││
│                       │  ├──────────┼────┼──────┼──────┤│
│                       │  │ 우유 1L  │ 2  │3,200 │6,400 ││
│                       │  │ 식빵     │ 1  │2,500 │2,500 ││
│                       │  └──────────┴────┴──────┴──────┘│
│                       │  [+ 항목 추가]                  │
└───────────────────────┴─────────────────────────────────┘
```

---

#### 화면 5 — 통계 분석 (`/stats`)

```
┌─────────────────────────────────────────────────────────┐
│  통계 분석                                              │
│  [이번 달 ▼]  2025-04-01 ~ 2025-04-30   [조회]         │
├─────────────────────────────────────────────────────────┤
│  총 지출: ₩ 320,000    건수: 12건    최다 카테고리: 식료품│
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │            월별 지출 합계 (BarChart)              │   │
│  │  [막대 그래프 — 최근 6개월]                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌───────────────────────┐ ┌──────────────────────────┐ │
│  │  카테고리별 비율      │ │  일별 지출 추이           │ │
│  │  (PieChart + 범례)    │ │  (LineChart)              │ │
│  └───────────────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### 13.7 반응형 브레이크포인트

| 브레이크포인트 | Tailwind 접두사 | 너비 | 레이아웃 변화 |
|--------------|----------------|------|--------------|
| Mobile | (기본) | < 768px | 사이드바 숨김, 단일 컬럼 레이아웃 |
| Tablet | `md:` | ≥ 768px | 사이드바 오버레이, 2컬럼 카드 |
| Desktop | `lg:` | ≥ 1024px | 사이드바 고정 표시, 다중 컬럼 |
| Wide | `xl:` | ≥ 1280px | 최대 너비(`max-w-7xl`) 고정 |

#### 주요 반응형 처리

| 요소 | Mobile | Desktop |
|------|--------|---------|
| 사이드바 | 햄버거 메뉴로 토글 | 항상 표시 (`w-64`) |
| 대시보드 요약 카드 | 1열 세로 배치 | 3열 수평 배치 |
| 차트 2종 배치 | 1열 세로 배치 | 2열 수평 배치 |
| 테이블 | 핵심 컬럼만 표시 (날짜·금액) | 전체 컬럼 표시 |
| 지출 상세 화면 | 이미지·폼 세로 배치 | 이미지·폼 좌우 분리 |

---

### 13.8 아이콘 및 시각 요소

| 항목 | 라이브러리 | 사용 방식 |
|------|-----------|-----------|
| 아이콘 | `lucide-react` | `import { Upload, Trash2, Edit, ChevronRight } from 'lucide-react'` |
| 로딩 | TailwindCSS Animate | `animate-spin`, `animate-pulse` (Skeleton UI) |
| 빈 상태 | SVG 인라인 일러스트 | 업로드 유도 메시지 + CTA 버튼 |
| 파비콘 | `public/favicon.ico` | 영수증 아이콘 |

#### 주요 아이콘 매핑

| 기능 | 아이콘 |
|------|--------|
| 업로드 | `<Upload />` |
| 삭제 | `<Trash2 />` |
| 수정 | `<Edit />` |
| 검색 | `<Search />` |
| 달력/날짜 | `<Calendar />` |
| 차트/통계 | `<BarChart2 />` |
| 영수증 목록 | `<List />` |
| 대시보드 | `<LayoutDashboard />` |
| 닫기 | `<X />` |

---

### 13.9 애니메이션 및 인터랙션

| 상황 | 처리 방식 |
|------|-----------|
| 버튼 호버 | `transition-colors duration-150` |
| 카드 호버 | `hover:shadow-md transition-shadow duration-150` |
| 테이블 행 호버 | `hover:bg-blue-50 transition-colors` |
| 페이지 전환 | React Router 기본 (애니메이션 미적용, MVP 범위 외) |
| OCR 분석 진행 | 프로그레스 바 (`transition-all duration-300`) |
| 모달 열기/닫기 | `opacity-0 → opacity-100 transition-opacity duration-200` |
| 토스트 진입 | `translate-y-2 opacity-0 → translate-y-0 opacity-100` |

---

## 14. 개발 일정 및 마일스톤

### 14.1 개발 우선순위 정의

기능 요구사항의 P0/P1/P2 우선순위를 기반으로, 아래 세 가지 기준을 종합하여 스프린트 순서를 결정합니다.

| 기준 | 설명 |
|------|------|
| **사용자 가치** | 핵심 사용 흐름(업로드 → 저장 → 조회)에 직결되는가 |
| **기술 의존성** | 다른 기능이 이 기능에 선행 의존하는가 |
| **구현 복잡도** | 단독으로 빠르게 완성 가능한가 |

#### 기능별 우선순위 매트릭스

| 기능 | 우선순위 | 사용자 가치 | 기술 의존성 | 복잡도 | 개발 주차 |
|------|:-------:|:----------:|:-----------:|:------:|:--------:|
| 개발 환경 세팅 및 DB 스키마 | P0 | 기반 | 없음 | 낮음 | 1주차 |
| FastAPI 프로젝트 골격 구성 | P0 | 기반 | 없음 | 낮음 | 1주차 |
| React + Vite 프로젝트 골격 구성 | P0 | 기반 | 없음 | 낮음 | 1주차 |
| Upstage OCR 연동 및 JSON 파싱 | P0 | 최상 | DB 저장 선행 필요 | 높음 | 2주차 |
| 영수증 업로드 API (`POST /api/receipts/upload`) | P0 | 최상 | OCR 서비스 선행 필요 | 중간 | 2주차 |
| SQLite CRUD API (목록·상세·수정·삭제) | P0 | 높음 | DB 스키마 선행 필요 | 중간 | 2주차 |
| 영수증 업로드 UI (DropZone, 진행바) | P0 | 최상 | 업로드 API 선행 필요 | 중간 | 3주차 |
| 지출 내역 목록 UI (테이블, 필터) | P0 | 높음 | 목록 API 선행 필요 | 중간 | 3주차 |
| 지출 상세/수정 UI (폼, 인라인 편집) | P1 | 높음 | 상세 API 선행 필요 | 중간 | 3주차 |
| 메인 대시보드 (요약 카드) | P1 | 중간 | 목록 API 선행 필요 | 낮음 | 4주차 |
| 통계 API (`GET /api/stats/summary`) | P1 | 중간 | CRUD 완성 선행 필요 | 중간 | 4주차 |
| 통계 차트 UI (Bar·Pie·Line) | P1 | 중간 | 통계 API 선행 필요 | 중간 | 4주차 |
| 반응형 레이아웃 및 UX 개선 | P1 | 중간 | 전체 UI 선행 필요 | 낮음 | 5주차 |
| 통합 테스트 및 버그 수정 | P1 | 기반 | 전체 기능 선행 필요 | 중간 | 5주차 |
| Vercel 배포 및 문서화 | P1 | 기반 | 전체 완성 선행 필요 | 낮음 | 5주차 |
| 영수증 이미지 썸네일·모달 확대 | P2 | 낮음 | 이미지 저장 선행 필요 | 낮음 | 이후 |

---

### 14.2 전체 일정 개요 (5주)

```
주차       W1          W2          W3          W4          W5
       ┌──────────┬──────────┬──────────┬──────────┬──────────┐
BE     │환경 세팅  │OCR/CRUD  │API 안정화│통계 API  │버그 수정  │
       │DB 스키마  │API 구현  │파일 처리 │          │          │
       ├──────────┼──────────┼──────────┼──────────┼──────────┤
FE     │프로젝트  │컴포넌트  │업로드 UI │통계 차트 │반응형 UX │
       │골격 구성 │설계      │목록/상세 │대시보드  │최종 통합 │
       ├──────────┼──────────┼──────────┼──────────┼──────────┤
공통   │API 명세  │          │BE↔FE 연동│          │배포/문서 │
       │확정      │          │테스트    │          │          │
       └──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

### 14.3 스프린트별 상세 일정

#### Sprint 1 (1주차) — 환경 세팅 및 기반 구축

**목표:** 개발 환경 구성 완료, 백·프론트 프로젝트 골격 완성, DB 스키마 확정

| 구분 | 작업 항목 | 산출물 | 완료 기준 |
|------|----------|--------|-----------|
| 공통 | Git 저장소 초기화 및 브랜치 전략 적용 | `main`, `develop` 브랜치 | PR 워크플로우 정상 동작 |
| 공통 | `.env.example` 및 환경변수 목록 확정 | `.env.example` (BE/FE) | 팀원 환경 재현 가능 |
| BE | Python 가상환경 및 `requirements.txt` 구성 | `requirements.txt` | `uvicorn` 서버 정상 기동 |
| BE | FastAPI 앱 진입점 및 라우터 골격 생성 | `app/main.py`, `routers/` | `/docs` Swagger 접근 가능 |
| BE | SQLAlchemy 모델 및 DB 초기화 스크립트 작성 | `models/`, `database.py` | `receipts`, `receipt_items` 테이블 생성 확인 |
| FE | React + Vite + TailwindCSS 프로젝트 초기화 | `frontend/` 기본 구조 | 개발 서버 정상 기동 |
| FE | React Router 설정 및 페이지 컴포넌트 Shell 생성 | `App.jsx`, `pages/` | 5개 경로 라우팅 동작 |
| FE | Header, Sidebar 레이아웃 컴포넌트 구현 | `layout/Header.jsx`, `Sidebar.jsx` | 전체 페이지 공통 레이아웃 적용 |
| FE | Axios 인스턴스 및 API 모듈 기반 설정 | `api/axiosInstance.js` | `VITE_API_BASE_URL` 환경변수 연동 |

**마일스톤 M1:** 백·프론트 개발 서버 각각 정상 기동, DB 테이블 생성 확인

---

#### Sprint 2 (2주차) — 핵심 백엔드 구현

**목표:** Upstage OCR 연동 완성, 영수증 CRUD API 전체 구현

| 구분 | 작업 항목 | 산출물 | 완료 기준 |
|------|----------|--------|-----------|
| BE | Upstage Vision LLM 연동 및 JSON 파싱 구현 | `services/ocr_service.py` | 샘플 영수증 → JSON 정상 추출 |
| BE | 파일 업로드 검증 (확장자, MIME, 10MB 제한) | `utils/file_utils.py` | 오류 파일 업로드 시 400/422 반환 |
| BE | 영수증 업로드 API 구현 (`POST /api/receipts/upload`) | `routers/receipts.py` | OCR 결과 DB 저장 및 JSON 응답 확인 |
| BE | 영수증 목록 조회 API (`GET /api/receipts`) | `routers/receipts.py` | 필터(날짜·카테고리·상호명), 페이지네이션 동작 |
| BE | 영수증 상세 조회 API (`GET /api/receipts/{id}`) | `routers/receipts.py` | 영수증 + 항목 목록 함께 반환 |
| BE | 영수증 수정 API (`PUT /api/receipts/{id}`) | `routers/receipts.py` | 수정 데이터 DB 반영 확인 |
| BE | 영수증 삭제 API (`DELETE /api/receipts/{id}`) | `routers/receipts.py` | CASCADE 삭제 동작 확인 |
| BE | 카테고리 목록 API (`GET /api/categories`) | `routers/categories.py` | 7개 카테고리 목록 반환 |
| BE | Pydantic 스키마 정의 (요청/응답 모델) | `schemas/` | FastAPI 자동 검증 동작 |
| BE | pytest 기반 API 테스트 작성 | `tests/test_receipts.py` | 핵심 엔드포인트 Happy Path 통과 |

**마일스톤 M2:** Postman/Swagger에서 전체 CRUD API 동작 확인, OCR 분석 결과 DB 저장 검증

---

#### Sprint 3 (3주차) — 핵심 프론트엔드 구현 및 BE↔FE 연동

**목표:** 업로드·목록·상세 화면 구현 완료, 백엔드 연동 완성

| 구분 | 작업 항목 | 산출물 | 완료 기준 |
|------|----------|--------|-----------|
| FE | DropZone 컴포넌트 (드래그앤드롭, 파일 검증) | `components/receipt/DropZone.jsx` | 파일 형식·크기 클라이언트 검증 동작 |
| FE | 업로드 화면 구현 (미리보기, 진행바) | `pages/Upload.jsx` | OCR 분석 완료 후 상세 화면 자동 이동 |
| FE | 지출 내역 목록 화면 (테이블, 필터바, 페이지네이션) | `pages/ExpenseList.jsx` | 필터 조건 적용 시 목록 동적 갱신 |
| FE | 지출 상세/수정 화면 (항목 인라인 편집, 저장) | `pages/ExpenseDetail.jsx` | 수정 저장 후 목록 반영 확인 |
| FE | ReceiptTable, FilterBar, Pagination 컴포넌트 | `components/receipt/`, `common/` | 재사용 컴포넌트 단독 렌더링 확인 |
| FE | Modal 컴포넌트 (이미지 확대, 삭제 확인) | `components/common/Modal.jsx` | ESC 키 및 외부 클릭 닫기 동작 |
| FE | Toast 알림 컴포넌트 및 Context 연동 | `components/common/Toast.jsx` | 저장/삭제/에러 시 3초 토스트 표시 |
| FE | `useReceipts`, `useReceiptDetail` 커스텀 훅 | `hooks/` | 로딩·에러 상태 처리 포함 |
| 공통 | CORS 설정 및 BE↔FE 연동 테스트 | `app/main.py` CORS | 프론트에서 전체 API 호출 성공 |

**마일스톤 M3:** 영수증 업로드 → OCR 분석 → 목록 조회 → 상세 수정 전체 흐름 End-to-End 동작

---

#### Sprint 4 (4주차) — 통계 기능 및 대시보드 완성

**목표:** 통계 API 구현, 차트 UI 완성, 메인 대시보드 구성

| 구분 | 작업 항목 | 산출물 | 완료 기준 |
|------|----------|--------|-----------|
| BE | 통계 집계 서비스 구현 (월별·카테고리별·일별) | `services/stats_service.py` | SQL 집계 쿼리 결과 정확성 검증 |
| BE | 통계 API (`GET /api/stats/summary`) | `routers/stats.py` | 기간 파라미터 적용 결과 정상 반환 |
| BE | 통계 API 테스트 작성 | `tests/test_stats.py` | 날짜 범위별 집계 결과 검증 |
| FE | MonthlyBarChart 컴포넌트 (Recharts BarChart) | `components/charts/MonthlyBarChart.jsx` | 월별 데이터 막대 차트 렌더링 |
| FE | CategoryPieChart 컴포넌트 (Recharts PieChart) | `components/charts/CategoryPieChart.jsx` | 카테고리 비율·범례·% 표시 |
| FE | DailyLineChart 컴포넌트 (Recharts LineChart) | `components/charts/DailyLineChart.jsx` | 일별 추이 선 그래프 렌더링 |
| FE | 통계 분석 화면 (기간 선택기 + 3종 차트) | `pages/Stats.jsx` | 기간 변경 시 차트 데이터 동적 갱신 |
| FE | 메인 대시보드 (요약 카드 3종 + 최근 지출 5건) | `pages/Dashboard.jsx` | 데이터 없을 때 Empty State 표시 |
| FE | `useStats` 커스텀 훅 | `hooks/useStats.js` | 로딩·에러 상태 포함 |

**마일스톤 M4:** 대시보드와 통계 분석 화면에서 실데이터 기반 차트 정상 렌더링 확인

---

#### Sprint 5 (5주차) — 품질 개선 및 배포

**목표:** UX 개선, 통합 테스트, Vercel 배포 완료, 문서화

| 구분 | 작업 항목 | 산출물 | 완료 기준 |
|------|----------|--------|-----------|
| FE | 반응형 레이아웃 적용 (Mobile/Tablet 대응) | 전체 페이지 | md: 브레이크포인트 이하 레이아웃 정상 동작 |
| FE | Skeleton UI 및 Empty State 전체 적용 | `LoadingSpinner.jsx`, `EmptyState.jsx` | 로딩·빈 상태 모든 화면에서 표시 |
| FE | 접근성 기본 처리 (alt 속성, 키보드 탭 이동) | 전체 컴포넌트 | 주요 액션 키보드로 수행 가능 |
| BE | OCR 실패·API 오류 예외 처리 보강 | `services/ocr_service.py` | 오류 시 사용자 친화적 메시지 반환 |
| BE | 업로드 파일 정리 (DB 삭제 시 이미지 파일 동기 삭제) | `services/receipt_service.py` | 영수증 삭제 후 이미지 파일 제거 확인 |
| 공통 | End-to-End 통합 테스트 시나리오 수행 | 테스트 결과 문서 | 핵심 5개 시나리오 전부 통과 |
| 공통 | 발견된 버그 수정 | — | 우선순위 버그 0건 잔존 |
| 공통 | Vercel 프로젝트 연동 및 환경변수 등록 | Vercel 배포 URL | `main` 브랜치 push 시 자동 배포 확인 |
| 공통 | `README.md` 작성 (설치·실행·환경변수 가이드) | `README.md` (BE/FE/루트) | 신규 개발자 로컬 환경 재현 가능 |

**마일스톤 M5 (최종):** Vercel 배포 URL에서 전체 기능 정상 동작, README 기반 로컬 실행 재현 성공

---

### 14.4 마일스톤 요약

| 마일스톤 | 주차 | 완료 기준 |
|:--------:|:----:|-----------|
| **M1** 기반 구축 완료 | 1주차 말 | 백·프론트 개발 서버 기동, DB 테이블 생성 |
| **M2** 백엔드 API 완성 | 2주차 말 | 전체 CRUD + OCR API Swagger 검증 통과 |
| **M3** E2E 핵심 흐름 동작 | 3주차 말 | 업로드 → 분석 → 저장 → 조회 흐름 완성 |
| **M4** 통계/대시보드 완성 | 4주차 말 | 실데이터 기반 차트 3종 정상 렌더링 |
| **M5** 배포 및 MVP 완성 | 5주차 말 | Vercel 배포 URL 전체 기능 동작 |

---

### 14.5 통합 테스트 시나리오

Sprint 5에서 수행할 핵심 E2E 시나리오입니다.

| # | 시나리오 | 예상 결과 |
|:-:|----------|-----------|
| T-01 | JPG 영수증 업로드 → OCR 분석 → 상세 화면 자동 이동 | 10초 이내 분석 완료, 날짜·상호명·합계 정상 추출 |
| T-02 | PDF 영수증 업로드 → OCR 분석 → DB 저장 확인 | PDF 파싱 후 항목 목록 정상 저장 |
| T-03 | 지원하지 않는 파일 형식(.xlsx) 업로드 시도 | "지원하지 않는 파일 형식" 에러 메시지 표시 |
| T-04 | 저장된 영수증 항목 수정 후 저장 → 목록 반영 확인 | 수정 내용이 목록과 상세 화면에 즉시 반영 |
| T-05 | 영수증 삭제 → 목록 및 DB에서 제거 확인 | 삭제 후 목록에서 사라지고 직접 URL 접근 시 404 |
| T-06 | 날짜·카테고리 필터 적용 → 조건에 맞는 결과만 표시 | 필터 조건 외 데이터 미노출 |
| T-07 | 통계 화면 기간 변경 → 차트 데이터 갱신 | 선택 기간에 해당하는 집계 수치로 차트 업데이트 |

---

## 15. 향후 로드맵

### Phase 2 — 기능 강화

| 기능 | 설명 |
|------|------|
| AI 카테고리 자동 분류 | LLM이 상호명/항목명 기반으로 카테고리 자동 태깅 |
| 월별 예산 설정 및 알림 | 카테고리별 예산 초과 시 경고 표시 |
| 가계부 내보내기 | Excel / CSV / PDF 형식 지원 |
| AI 소비 리포트 | LLM 기반 월별 소비 패턴 분석 리포트 자동 생성 |

### Phase 3 — 확장

| 기능 | 설명 |
|------|------|
| 다중 사용자 지원 | JWT 인증 기반 개인별 지출 데이터 분리 |
| DB 마이그레이션 | SQLite → PostgreSQL 전환 |
| 모바일 앱 | PWA 또는 React Native 기반 모바일 카메라 연동 |
| 백엔드 서버리스 전환 | AWS Lambda / GCP Cloud Run |

---

*AI 영수증 지출 관리 시스템 PRD v1.0.0*  
*최종 수정: 2026-04-13*

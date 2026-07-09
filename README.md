# BookMarket

고요하고 세심하게 큐레이션된, 오늘의 서점. Apple × Linear × Raycast × 독립 서점의 감성을 지향하는 프리미엄 온라인 서점입니다.

풀스택 구성: **Spring Boot 백엔드** + **React 프론트엔드**.

## 주요 기능

- **홈** — 시네마틱 히어로 영상, 이달의 추천 도서
- **도서 목록/상세** — 제목·저자 검색, 정렬(이름/출간일/가격), 페이지네이션, 카테고리 필터
- **장바구니 / 3단계 체크아웃** — 배송지 입력(프로필 자동 채움) → 주문 확인 → 완료
- **커뮤니티 게시판** — 글 작성/수정/삭제, 페이지네이션
- **회원가입 / 로그인** — JWT(Access + Refresh) 기반 인증
- **마이페이지** — 프로필 수정, 주문 내역(페이지네이션), 계정 삭제
- **관리자 대시보드** — 도서/주문/회원/게시판 관리, 이미지 업로드

## 기술 스택

| | |
|---|---|
| **Backend** | Spring Boot 4 (Java 21), Spring Security + JWT(jjwt), Spring Data JPA/Hibernate, MySQL 8, springdoc-openapi(Swagger UI) |
| **Frontend** | React 19 + Vite(Rolldown), React Router 7, lucide-react, 순수 CSS(디자인 토큰 기반) |
| **Infra** | Docker(MySQL) |

## 프로젝트 구조

```
.
├── bookmarket/          # Spring Boot 백엔드
│   └── src/main/resources/application.properties.example
├── frontend/            # React 프론트엔드 (Vite)
│   └── .env.example
├── docker-compose.yml   # 로컬 개발용 MySQL
├── verify.sh            # API 스모크 테스트 (bash + curl + jq)
└── verify.py            # API 스모크 테스트 (python3, 표준 라이브러리만 사용)
```

## 시작하기

### 준비물

- Java 21
- Node.js 18+
- Docker (MySQL 실행용) — 또는 로컬에 MySQL 8 인스턴스

### 1. 데이터베이스 실행

```bash
docker compose up -d
```

`localhost:3308`에 `bookmarket` 데이터베이스가 생성됩니다.

### 2. 백엔드 실행

```bash
cd bookmarket
cp src/main/resources/application.properties.example src/main/resources/application.properties
# application.properties에서 app.jwt.secret 값을 꼭 랜덤 값으로 교체하세요:
#   openssl rand -hex 32
./gradlew bootRun
```

- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html

최초 실행 시 샘플 회원 2명과 도서 30여 권이 자동으로 시딩됩니다.

| 계정 | 아이디 | 비밀번호 | 권한 |
|---|---|---|---|
| 관리자 | `admin` | `admin1234` | ADMIN |
| 일반 회원 | `user01` | `user01234` | USER |

### 3. 프론트엔드 실행

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

http://localhost:5173 에서 접속합니다. (백엔드 CORS는 `5173`, `5174` 두 포트를 모두 허용하도록 설정되어 있습니다.)

## API 검증 스크립트

브라우저 없이 백엔드 핵심 플로우(회원가입→로그인→도서 검색/정렬/페이지네이션→장바구니→주문→게시판→관리자 조회)를 자동으로 점검합니다.

```bash
./verify.sh          # bash + curl + jq
python3 verify.py    # 표준 라이브러리만 사용, pip install 불필요
```

`BASE_URL` 환경변수로 대상 서버를 바꿀 수 있습니다.

## 참고

- 백엔드 API 명세는 Swagger UI에서 확인하는 것이 가장 정확합니다 (DTO 필드명이 요청/응답 간에 일부 일관되지 않는 부분이 있습니다).
- `application.properties`와 프론트엔드 `.env`는 `.gitignore`에 포함되어 있습니다 — 각 `.example` 파일을 복사해서 사용하세요.

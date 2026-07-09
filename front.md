# front.md — bookmarket frontend

에이전틱 코딩을 위한 프론트엔드 코드베이스 압축 지도. 소스 파일을 열기 전에 먼저 읽을 것.

## 1. 현재 상태 — 가장 먼저 읽을 것

**이건 손대지 않은 Vite+React 스캐폴드다.** `src/` 아래 모든 파일은 기본 템플릿 그대로(데모 카운터 버튼, Vite/React 로고, 기본 CSS). 라우터도, API 클라이언트도, 상태관리 라이브러리도, 인증/세션 처리도, 폼도 없고, `pages/`, `components/`, `api/`, `hooks/`, `store/` 디렉터리도 존재하지 않음. `bookmarket` 백엔드와 통신하는 코드는 아직 하나도 없음.

이 문서는 "지금 존재하는 것"과 "앞으로 만들어야 할 것 및 그때 지켜야 할 제약사항"을 함께 담고 있는 것이지, 이미 확립된 아키텍처를 설명하는 게 아님.

## 2. 목적 & 런타임 스택

React 19.2 + Vite 8, 순수 JavaScript(`.jsx`, TypeScript 없음 — `tsconfig.json` 없음, dev-dependency 스텁 외에 `@types` 사용도 없음). 특이하게 `@vitejs/plugin-react`와 함께 `@rolldown/plugin-babel`을 사용함 — 이는 클래식 esbuild/Rollup 기반 Vite가 아니라 Rolldown 기반 Vite 라인임; 클래식 Vite 문서/플러그인이 그대로 다 적용된다고 가정하지 말 것. React Compiler는 `babel-plugin-react-compiler`를 통해 활성화되어 있음(`vite.config.js`의 rolldown babel 플러그인 경유) — 컴파일러가 자동으로 메모이제이션을 해주므로, 프로파일링으로 실제 필요성이 확인되기 전에는 수동으로 `useMemo`/`useCallback`을 추가하지 말 것.

## 3. 설치 / 실행 / 빌드 / 린트 / 테스트

- `npm install`
- `npm run dev` — Vite 개발 서버, 기본 포트 `5173`
- `npm run build` — `vite build`를 통한 프로덕션 빌드
- `npm run preview` — 프로덕션 빌드를 로컬에서 서빙
- `npm run lint` — ESLint(flat config, `eslint.config.js`)
- **테스트 러너는 설정되어 있지 않음**(`vitest`/`jest` 의존성 없음, 테스트 스크립트 없음). 테스트가 필요한 작업이라면 프레임워크를 처음부터 셋업해야 함(이 Vite 셋업에는 Vitest가 자연스러운 선택임) — 이미 존재한다고 가정하지 말 것.

## 4. 설정 파일 & 환경변수

- `vite.config.js` — 플러그인: `@vitejs/plugin-react`, `@rolldown/plugin-babel`(`reactCompilerPreset()` 포함). `server.proxy` 없음, 경로 alias 없음, 환경변수 연결 설정 없음.
- `eslint.config.js` — flat config: `js.configs.recommended` + `eslint-plugin-react-hooks`(flat recommended) + `eslint-plugin-react-refresh`(vite config), 브라우저 globals, JSX 활성화. `dist/`는 무시됨.
- `index.html` — `<div id="root">` 하나, `/src/main.jsx`를 모듈로 로드. 타이틀은 일반적인 `"frontend"` — 아직 커스터마이징되지 않음.
- **`.env` 파일이 존재하지 않고, 코드 어디에도 `import.meta.env.*` 사용처가 없음.** 현재 백엔드 base URL을 설정할 수 있는 곳이 전혀 없음 — 직접 도입해야 함(컨벤션: `.env` 파일에 `VITE_API_BASE_URL`, `import.meta.env.VITE_API_BASE_URL`로 읽기).

## 5. 디렉터리 / 컴포넌트 구조

```
public/
  favicon.svg, icons.svg        <use href="/icons.svg#...">로 참조되는 아이콘 스프라이트
src/
  main.jsx                      ReactDOM root, <StrictMode><App/></StrictMode>
  App.jsx                       단일 데모 컴포넌트 (Vite/React 스타터 콘텐츠 — 카운터 버튼,
                                 vite.dev/react.dev 링크, docs/social 섹션). 확장하지 말고 교체할 것.
  App.css                       App.jsx용 컴포넌트 스코프 성격의 순수 CSS (네이티브 CSS 중첩 사용)
  index.css                     전역 스타일 + CSS 커스텀 프로퍼티 (디자인 토큰, §9 참고)
  assets/                       react.svg, vite.svg, hero.png (데모 이미지, App.jsx를 다시 작성할 때 삭제해도 안전함)
```

`pages/`, `components/`, `layouts/`, `hooks/`, `api/`, `context/`, `store/` 디렉터리는 존재하지 않음. 실제 기능을 만들 때는 이 구조를 처음부터 새로 만드는 것임 — 아직 확립된 게 없으므로 네이밍을 지어내기 전에 사용자와 확인하거나 `backend.md`의 기존 컨벤션을 참고할 것.

## 6. 라우팅

**설치되어 있지 않음.** `package.json`에 `react-router-dom`이나 다른 라우터가 없음. `App.jsx`가 모든 걸 무조건적으로 렌더링함. 멀티 페이지 내비게이션을 추가하려면 먼저 라우터를 설치해야 함.

## 7. API 클라이언트 & 백엔드 Base URL

**존재하지 않음.** `fetch` 래퍼도, `axios`(의존성 아님)도, 중앙화된 요청/응답 처리도, 로딩/에러 상태 컨벤션도 없음. 이걸 만들 때 알아야 할 것:

- 백엔드(`bookmarket`, `backend.md` 참고)는 기본적으로 `http://localhost:8080`에서 실행되며 `/api/...` 외에 별도 설정 가능한 base path는 없음.
- **백엔드에 CORS가 실제로 설정되어 있지 않음**(`backend.md` §12 참고) — Vite 개발 서버(`:5173`)에서 API(`:8080`)로 가는 크로스오리진 요청은, 백엔드가 `CorsConfigurationSource` 빈을 추가하거나, 개발 요청을 `vite.config.js`의 Vite `server.proxy`로 우회시키기 전까지는(이 방법은 개발 중 크로스오리진 문제를 완전히 피할 수 있지만, 앱이 API와 동일 오리진/리버스 프록시 뒤에서 서빙되지 않는 한 프로덕션에서는 도움이 되지 않음) 프리플라이트에서 실패할 가능성이 높음.
- 백엔드 응답은 항상 감싸져 있음: `{ status, message, data }` (`data`는 일부 에러/no-content 응답에서 없을 수 있음). 페이지네이션 엔드포인트는 `data` 안에 `{ content, totalElements, totalPages, pageNumber, pageSize, first, last }`를 중첩시킴. API 클라이언트는 raw 응답 바디를 그대로 페이로드로 취급하지 말고 반드시 `.data`를 한 겹 벗겨내야 함.

## 8. 백엔드가 기대하는 데이터 형태

권위 있는 출처는 `backend.md` §7~§10 참고. 소비하게 될 주요 응답 DTO: `BookResponse`, `MemberResponse`, `TokenResponse`, `CartResponse`/`CartItemResponse`, `OrderResponse`/`OrderItemResponse`, `BoardResponse`. 백엔드 요청 DTO 간 필드명은 **일관되지 않음**(예: 회원가입은 `memberId`, 로그인은 `username` 사용) — 패턴을 가정하지 말고 Swagger UI(`http://localhost:8080/swagger-ui/index.html`)로 해당 엔드포인트를 직접 확인할 것.

## 9. 인증 / 세션 처리

**구현되어 있지 않음.** 토큰 저장 로직(`localStorage`/`sessionStorage`/쿠키)도, 인증 context도, protected-route 패턴도 없음. 백엔드는 JWT access + refresh 토큰을 발급하며(`backend.md` §6 참고) `Authorization: Bearer <token>` 형태를 기대함; 토큰 저장, 요청에의 부착, 만료 시 갱신을 프론트엔드가 직접 구현해야 함.

## 10. 상태 관리

**없음.** 로컬 `useState`만 존재함(`App.jsx`의 데모 카운터). Redux/Zustand/Jotai나 Context 기반 전역 스토어 없음. React 19 + React Compiler 환경이므로, 작업 범위가 정말로 라이브러리를 필요로 하지 않는 한 내장 상태(`useState`/`useReducer`/Context)를 우선할 것 — 미리 라이브러리를 추가하지 말 것.

## 11. 스타일링 / 디자인 시스템

순수 CSS, CSS-in-JS 없음, Tailwind 없음, 컴포넌트 라이브러리 없음. `index.css`는 라이트/다크 토큰 시스템을 CSS 커스텀 프로퍼티로 정의함(`@media (prefers-color-scheme: dark)`로 자동 전환):
- `--text`, `--text-h`(헤딩 텍스트), `--bg`, `--border`, `--code-bg`, `--accent`, `--accent-bg`, `--accent-border`, `--shadow`, 그리고 `--sans`/`--heading`/`--mono` 폰트 스택.
- 기본 폰트 크기는 `18px`(`max-width: 1024px` 이하에서는 `16px`), `#root`는 가운데 정렬된 `1126px` max-width 컬럼이며 인라인 테두리가 있음.

`App.css`는 네이티브 CSS 중첩(선택자 내부의 `&:hover`, `&:focus-visible`)을 사용함 — Vite의 CSS 파이프라인에서 문제없이 처리되므로, 전처리기를 도입하기보다 중첩을 계속 사용할 것. 실제 디자인 시스템이 필요하다면 아직 존재하지 않음 — 이건 스캐폴드 기본 스타일일 뿐임.

## 12. 폼 & 검증

**구현되어 있지 않음** — 유일한 인터랙티브 요소는 데모 증가 버튼이고 폼이 아님. 검증 라이브러리도 설치되어 있지 않음(`zod`/`yup`/`react-hook-form` 없음). 회원가입/로그인/결제/게시글 작성 폼을 만든다는 것은 이 패턴을 처음부터 확립한다는 뜻임; 클라이언트 검증이 서버 규칙을 반영할 수 있도록 `backend.md` §10의 검증 규칙을 확인할 것(예: `SignupRequest`의 아이디 4~50자, 비밀번호 최소 4자 등) — 다만 최종 기준은 여전히 백엔드이며, 유효하지 않은 입력은 어차피 거부됨.

## 13. 로딩 / 에러 / 빈 상태

**확립된 패턴 없음** — 아직 데이터 페칭이 없으므로 로딩 스피너, 에러 바운더리, 빈 상태 컴포넌트도 없음. 백엔드가 에러를 `{status, message, data?}` 형태로 감싸고(`backend.md` §10 참고) 검증 에러(400)에는 `필드 → 메시지` 맵을 포함시키므로, 클라이언트 에러 처리는 이 형태를 기준으로 설계할 것.

## 14. 백엔드/프론트엔드 연동 공백 (뭔가 연결하기 전에 읽을 것)

- **CORS**: 백엔드에 작동하는 CORS 정책이 없음 — 백엔드가 `CorsConfigurationSource` 빈을 추가하기 전까지 개발 서버에서의 직접적인 크로스오리진 호출은 실패할 가능성이 높음(프록시로 조용히 우회하면 프로덕션에서 다시 깨지므로, 우회 대신 사용자/백엔드 작업 쪽에 이 문제를 알릴 것).
- **양쪽 다 base URL 연결이 없음**: 프론트엔드에 환경변수 기반 API URL 설정이 없음; 컴포넌트에 `localhost:8080`을 하드코딩하지 말고 직접 도입할 것.
- **응답 포맷**: 모든 fetch는 `response.data.data`를 벗겨내야 함(HTTP 레이어에서 한 번, 백엔드의 `ApiResponse` 래퍼에서 한 번) — 깜빡하고 잘못된 레벨을 구조분해하기 쉬움.
- **인증 헤더 특이사항**: 백엔드의 `/api/auth/refresh` 엔드포인트는 refresh 토큰을 (일반 access 토큰처럼) `Authorization` 헤더로 기대함, JSON body가 아님 — `{ refreshToken: ... }` 형태의 body가 동작할 거라고 가정하지 말 것.

## 15. 프론트엔드 변경 후 권장 검증

1. `npm run lint`
2. `npm run build` (TypeScript가 없으므로 이게 주된 타입/문법 안전망임)
3. `npm run dev`로 브라우저에서 변경된 플로우를 직접 확인 — 기댈 수 있는 자동화 테스트 스위트가 없음
4. API 호출을 건드리는 변경이라면, 가정한 형태가 아니라 백엔드의 실제 Swagger UI(`http://localhost:8080/swagger-ui/index.html`)로 확인할 것 — DTO 필드명이 일관되지 않기 때문(§8 참고)

## 남은 불확실성

- 이 프로젝트에 TypeScript, 라우터, 특정 상태관리 라이브러리를 도입할 의도가 있는지 — 아직 정해진 게 없음; 작업 내용이 암시하지 않는 한 도입 전에 먼저 물어볼 것.
- `:5173` ↔ `:8080`을 개발 환경에서 연결하는 의도된 방법이 Vite dev proxy인지 아니면 실제 CORS 수정인지 — 코드베이스 어디에도 결정되어 있지 않음.

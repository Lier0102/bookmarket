# backend.md — bookmarket (Spring Boot API)

에이전틱 코딩을 위한 백엔드 코드베이스 압축 지도. 소스 파일을 열기 전에 먼저 읽을 것 — 트리를 grep하는 대신 특정 작업에 어떤 파일을 열어야 하는지 알려준다.

## 1. 목적 & 스택

온라인 서점 REST API ("BookMarket"). Java 21, Spring Boot 4.0.6, Gradle(wrapper, Groovy DSL), MySQL, Spring Data JPA/Hibernate, Spring Security(stateless JWT), springdoc-openapi(Swagger UI), Lombok, Log4j2, jjwt 0.12.5.

루트 패키지: `com.asdf.bookmarket`. 소스 루트: `src/main/java/com/asdf/bookmarket/`.

## 2. 실행 / 테스트 / 빌드

- 실행: `./gradlew bootRun` — `localhost:3307`에서 접근 가능한 MySQL 인스턴스가 필요함, 데이터베이스 `bookmarket`, 계정 `bankai`/`bankai` (`application.properties` 참고). **이 저장소에는 docker-compose 파일이 없음** — 해당 MySQL 인스턴스를 평소 어떻게 띄우는지는 `Unknown`. 이번 분석 시점에는 3307 포트에서 아무것도 응답하지 않았고 로컬 Docker 컨테이너도 실행 중이지 않았음. 앱이 부팅 가능하다고 가정하기 전에 `nc -zv localhost 3307`로 확인할 것, DB가 꺼져 있다면 사용자에게 개발 DB를 어떻게 띄우는지 물어볼 것.
- 테스트: `./gradlew test` — **Testcontainers** 사용 (`TestcontainersConfiguration.java`, `@ServiceConnection`을 통한 `mysql:latest` 이미지), 따라서 Docker 데몬이 실행 중이어야 함. `TestBookmarketApplication`은 Testcontainers 기반 로컬 실행 진입점(`SpringApplication.from(BookmarketApplication::main).with(TestcontainersConfiguration.class)`)으로, 실제 개발 DB를 건드리지 않고 임시 MySQL에 대해 수동으로 실행해볼 때 유용함.
- 빌드: `./gradlew build` (테스트 포함) 또는 `./gradlew bootJar` (기본적으로 아무것도 스킵하지 않음 — 테스트를 건너뛰려면 `./gradlew bootJar -x test`).
- 테스트 클래스는 단 하나만 존재함(`BookmarketApplicationTests`, context-load 스모크 테스트). 의미 있는 서비스/컨트롤러 테스트 스위트는 없음 — 동작이 테스트로 고정되어 있다고 가정하지 말 것.

## 3. Swagger UI

springdoc-openapi-starter-webmvc-ui가 클래스패스에 있고 `application.properties`에 별도 경로 오버라이드가 없으므로 기본값이 적용됨:
- UI: `http://localhost:8080/swagger-ui/index.html` (`/swagger-ui.html` 리다이렉트로도 접근 가능)
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

서버 포트는 Spring Boot 기본값인 `8080` (`application.properties`에 명시되어 있지 않음). Swagger 경로는 `SecurityConfig`에서 명시적으로 `permitAll` 처리됨. 전역 JWT bearer 인증 스킴은 `config/ApiDocumentationConfig.java`에 등록되어 있고, 컨트롤러별 `@SecurityRequirement(name = "bearerAuth")`는 선택적으로 적용됨 (§7 참고). **이번 세션에서는 실제로 확인하지 못함** — MySQL이 실행되고 있지 않아 앱을 부팅해서 확인할 수 없었음.

## 4. 설정 파일 / 프로파일 / 환경변수

파일 하나, Spring 프로파일 없음: `src/main/resources/application.properties`. `application-*.properties` 없음, `@Profile` 사용처도 어디에도 없음.

주요 속성 (전부 하드코딩, OS 환경변수에서 읽는 값 없음):
- `spring.datasource.url=jdbc:mysql://localhost:3307/bookmarket`, 계정/비번 `bankai`/`bankai`
- `spring.jpa.hibernate.ddl-auto=update` — Flyway/Liquibase 없음, 스키마는 Hibernate가 관리함
- `spring.jpa.open-in-view=false`
- `app.jwt.secret`, `app.jwt.access-token-expiration` (3600000ms / 1시간), `app.jwt.refresh-token-expiration` (604800000ms / 7일) — `JwtTokenProvider`에서 `@Value`로 읽음
- `app.upload.path=/Users/bankai/Documents/tmp/uploads` — **이 개발자 머신에 한정된 절대경로.** 다른 환경/배포 시 반드시 변경해야 함. `FileService`에서 `@Value`로 읽음.

## 5. 패키지 구조

```
config/     SecurityConfig, ApiDocumentationConfig, PasswordConfig (BCrypt 빈),
            AuditingConfig (@EnableJpaAuditing), DataInitializer (시드 데이터)
controller/ 리소스별 얇은 REST 컨트롤러, service에 위임, ApiResponse<T> 반환
dto/request/  검증되는 인바운드 페이로드 (jakarta.validation + Swagger용 @Schema)
dto/response/ 아웃바운드 뷰 모델, 각각 static `from(entity)` 매퍼 보유
entity/     JPA 엔티티 (§8 참고)
exception/  BusinessException, ErrorCode (enum: HttpStatus + 메시지), GlobalExceptionHandler
repository/ Spring Data JPA 인터페이스 (derived query + 일부 JPQL @Query fetch-join)
security/   JWT provider/filter, CustomerUserDetails(Service)
service/    비즈니스 로직; 서비스가 직접 엔티티를 응답 DTO로 매핑함
            (컨트롤러는 엔티티를 절대 보지 않음)
```

## 6. 인증 / 인가

`Authorization: Bearer <token>` 헤더를 통한 stateless JWT, `app.jwt.secret`으로부터 나온 HS256 키.

- `POST /api/auth/signup`, `/login`, `/refresh` — 전부 `permitAll`. `/refresh`는 **동일한 `Authorization` 헤더에서 refresh 토큰을 읽음**(JSON body 필드가 아님) — `AuthController.refresh` 참고.
- `JwtAuthenticationFilter`(`UsernamePasswordAuthenticationFilter` 이전에 실행)가 토큰을 검증하고 `CustomerUserDetailsService`를 통해 `CustomerUserDetails`를 로드함(`Member`를 `username`으로 조회하며, 이는 DB 컬럼 `member_id`에 매핑됨).
- 역할: enum `Role { USER, ADMIN }` → 부여된 권한 `ROLE_USER` / `ROLE_ADMIN`. 관리자 전용 엔드포인트는 `@PreAuthorize("hasRole('ADMIN')")` 사용 (`@EnableMethodSecurity`로 메서드 시큐리티 활성화됨).
- `SecurityConfig`의 공개 경로: Swagger 경로, `/api/auth/**`, 그리고 `/api/book/**`와 `/api/board/**`의 GET. 그 외는 전부 인증 필요.
- 커스텀 401/403 응답 바디는 **`SecurityConfig`의 예외 처리 내부에서 직접** 작성됨(Jackson `ObjectMapper`를 통한 원시 `Map.of("status", ..., "message", ...)`, `GlobalExceptionHandler`/`ApiResponse`를 거치지 않음). `ApiResponse`의 에러 형태를 바꾸면 `SecurityConfig`도 별도로 수정해야 함 — 다른 코드 경로임(필터 체인 레벨, `DispatcherServlet` 이전).

## 7. REST API 구조

기본 경로 `/api`. 응답 포맷은 항상 `ApiResponse<T>` (`{status, message, data}`, `@JsonInclude(NON_NULL)`로 인해 `data`가 null이면 생략됨). 페이지네이션 엔드포인트는 `data` 안에 `PageResponse<T>` (`{content, totalElements, totalPages, pageNumber, pageSize, first, last}`)를 감싸서 넣음. 페이지네이션 쿼리 파라미터는 일관되게 `page`, `size`, `sortField`, `sortDir` (기본값은 엔드포인트마다 다름 — 특정 컨트롤러/Swagger를 확인할 것, 여기 하드코딩할 가치 없음).

리소스 그룹:
- `/api/auth` — 회원가입, 로그인, 갱신 (공개)
- `/api/book` — GET 목록/카테고리/필터/단건조회/이미지는 공개; `POST /{bookId}/image` (multipart 업로드)는 관리자 전용. **도서 생성/수정/삭제는 여기 없음** — `/api/member` 아래에 있음(아래 참고), JSON을 통한 도서 생성은 항상 이미지에 `null`을 전달함(이미지는 `POST /api/book/{bookId}/image`로 별도 업로드해야 함).
- `/api/board` — GET 목록/단건조회는 공개; 생성/수정은 인증 필요; 수정/삭제는 관리자가 아닌 이상 작성자 일치 여부를 강제함(`BOARD_WRITER_MISMATCH`) (삭제만 관리자 예외 허용)
- `/api/cart` — 전부 인증 필요, 호출자 본인의 장바구니로 스코프됨(`@AuthenticationPrincipal`)
- `/api/member` — `/me` 셀프 서비스(조회/수정/삭제); `GET /`와 도서 생성·수정·삭제(`POST`, `PUT /{bookId}`, `DELETE /{bookId}`)는 관리자 전용이며 `BookController`가 아니라 `MemberController`에 있음
- `/api/order` — 호출자용 `/me`, `/me/{orderId}`; 관리자용 `/admin/**`(전체 목록, 임의 주문 조회/수정/삭제, 전체 삭제)

정확한 파라미터명/예시는 소스에서 재추론하기보다 Swagger UI로 확인할 것 — `@Operation`/`@Schema` 어노테이션에 이미 다 있음.

## 8. 도메인 모델

모든 엔티티는 Lombok `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor`를 사용함.

- **Member** (`members`) — `id`(PK), `username`(컬럼 `member_id`, unique), `password`(BCrypt 해시), `name`, `phone`, `email`, `address`(별도 `Address` 엔티티가 아닌 단순 문자열), `role`(enum). 역참조 매핑 없음.
- **Book** (`books`) — PK는 `bookId`(String, ISBN 형태, 예: `ISBN1234`, `BookCreateRequest`에서 정규식 `ISBN[0-9]+`로 검증됨). `unitPrice`(BigDecimal), `unitsInStock`(Long, 음수가 되면 예외를 던지는 `decreaseStock(int)` 도메인 메서드 보유), `fileName`(업로드된 이미지, BLOB이 아니라 `FileService`/파일시스템을 통해 제공됨).
- **Cart** (`carts`) — `Member`와 1:1(unique FK), `List<CartItem>` 소유(`cascade=ALL, orphanRemoval=true`), `grandTotal`은 `updateGrandTotal()`로 재계산됨 — **DB에서 자동 계산되는 컬럼이 아니므로 장바구니를 변경할 때마다 반드시 호출해야 함.**
- **CartItem** (`cart_items`) — `Cart`에 ManyToOne, `Book`에 ManyToOne, `quantity`, `totalPrice`(스냅샷, `updateQuantity()`로 재계산).
- **Order** (`orders`) — `Member`에 ManyToOne; **별개의 `Address` 엔티티 두 개**(`customerAddress`, `shippingAddress`), 각각 `@OneToOne(cascade=ALL)` — 즉 주문마다 새 `addresses` 로우가 2개씩 생성되며, 공유/중복제거되지 않음. `List<OrderItem>` 소유(`cascade=ALL, orphanRemoval=true`). `createdDate`는 `@CreatedDate`(JPA auditing).
- **OrderItem** (`order_items`) — `Order` + `Book`에 ManyToOne이지만, 주문 시점의 `bookName`과 `totalPrice`도 스냅샷으로 저장함(그래야 도서가 수정/삭제되어도 과거 주문 내역이 보존됨).
- **Address** (`addresses`) — 독립 엔티티, 역참조 없음; `Order`에 의해서만 생성/소유됨.
- **Board** (`boards`) — `Member`에 ManyToOne, `title`, `content`(TEXT), `createdDate`/`modifiedDate`는 `@CreatedDate`/`@LastModifiedDate`를 통함(`AuditingConfig`의 `@EnableJpaAuditing`이 필요하며, 이는 별도의 `@Configuration` 클래스임 — 옮기거나 제거하면 auditing이 조용히 동작을 멈춤).
- **Role** — enum `USER`, `ADMIN`.

시각적 다이어그램이 필요하면 `ERD.html`(브라우저에서 열기)을 참고하되, 위 엔티티 소스 파일이 진짜 기준임 — ERD는 코드와 어긋나 있을 수 있음.

## 9. Controller / Service / Repository 패턴

- 컨트롤러: `@RestController`, `@RequiredArgsConstructor`를 통한 생성자 주입, 항상 `ResponseEntity<ApiResponse<T>>` 반환. 엔티티는 절대 컨트롤러로 넘어가지 않음.
- 서비스: 모든 `@Transactional` 경계와 엔티티↔DTO 매핑을 전부 소유함(응답 DTO는 static `from(entity)` 팩토리를 가지며, 서비스가 이를 직접 호출함 — 컨트롤러는 결과를 그대로 전달만 함). 비즈니스 규칙 위반은 `BusinessException(ErrorCode.X)`를 던짐.
- 레포지토리: 평범한 Spring Data JPA 인터페이스. 일부는 컬렉션 연관관계의 N+1을 피하기 위해 `LEFT JOIN FETCH`를 사용하는 `@Query` JPQL을 사용함(`CartRepository.findByMemberWithItems`, `OrderRepository.findByIdWithDetails`) — 트랜잭션 밖에서 item들이 로드되어야 할 때는 `findById` 대신 이걸 우선 사용할 것.

## 10. DTO / 검증 / 에러 처리

- 요청 DTO: `jakarta.validation` 어노테이션(`@NotBlank`, `@Size`, `@Min`, `@Pattern` 등), 컨트롤러 파라미터에서 `@Valid`로 검증됨. 모든 요청 DTO는 Swagger 문서를 위한 `@Schema`도 갖고 있음.
- `GlobalExceptionHandler`(`@RestControllerAdvice`)가 처리하는 것들: `BusinessException` → 해당 `ErrorCode`의 상태/메시지; `MethodArgumentNotValidException` → 필드→메시지 맵과 함께 `400`; `HttpMessageNotReadableException` → `400`; `AccessDeniedException` → `403`; 나머지 전체 `Exception` → `500`. 전부 `ApiResponse`로 감싸짐.
- `ErrorCode`가 비즈니스 에러 상태+메시지의 단일 소스임(전체 목록은 `exception/ErrorCode.java` 참고 — 회원/도서/장바구니/주문/게시판/파일 에러).
- **DTO 간 필드명이 일관되지 않음**: `SignupRequest`는 `memberId`, `LoginRequest`는 `username`, `MemberResponse`는 `memberId`를 사용함. 공통 네이밍 컨벤션이 있다고 가정하지 말고 해당 DTO를 직접 확인할 것.

## 11. DB / 마이그레이션 / 시드 데이터

- Flyway/Liquibase 없음. `spring.jpa.hibernate.ddl-auto=update` — Hibernate가 부팅 시 엔티티 어노테이션을 기반으로 스키마를 자동 마이그레이션함.
- `DataInitializer`(`ApplicationRunner`)는 **테이블이 비어있을 때만** 데이터를 시딩함(`repository.count() > 0` 가드가 있어서 재시딩이나 리셋을 절대 하지 않음): admin(`admin`/`admin1234`, ROLE_ADMIN) + `user01`/`user01234`(ROLE_USER), 그리고 샘플 도서 4권. 새 시드 데이터가 필요하면 해당 테이블을 수동으로 비워야 함 — `ddl-auto=update`가 대신 해주지 않음.

## 12. CORS — ⚠️ 실제로는 설정되어 있지 않음

`SecurityConfig`가 `.cors(cors -> {})`(빈 커스터마이저)를 호출하지만, **코드베이스 어디에도 `CorsConfigurationSource` 빈이나 `WebMvcConfigurer#addCorsMappings`가 존재하지 않음**(전체 프로젝트 grep으로 확인함). 설정 소스가 등록되지 않은 채로 `.cors()`를 활성화하면 사실상 허용적인 크로스오리진 정책이 없는 것과 같음. 이 API를 다른 오리진에서 호출하는 프론트엔드(예: `localhost:5173`의 Vite 개발 서버 vs `localhost:8080`의 이 API)는 사소하지 않은 요청(커스텀 `Authorization` 헤더, `PUT`/`DELETE`를 통한 JSON body 등)에 대해 CORS 프리플라이트가 실패할 가능성이 높음.

**프론트엔드↔백엔드 연동이 동작하려면 반드시 먼저 고쳐야 함** — 설정 클래스에 `CorsConfigurationSource` 빈(허용 오리진, 메서드, 헤더, 그리고 허용/노출 헤더에 `Authorization` 포함)을 추가할 것. 프론트엔드 연동 작업을 요청받으면 이 점을 명시적으로 알릴 것.

## 13. 그 외 비명시적 주의사항
- `GET /api/book/{bookId}/image`는 실제 업로드된 파일 타입과 무관하게 항상 `Content-Type: image/jpeg`를 설정함 — PNG/WEBP 업로드는 잘못된 content-type 헤더로 제공됨.
- JWT secret이 `application.properties`에 평문으로 커밋되어 있음(환경변수 기반이 아님) — 로컬 개발용으로는 괜찮지만, 배포에 대해 질문받으면 짚어줄 것.
- `spring.jpa.show-sql=true`와 `com.asdf` / Spring Security에 대한 DEBUG 로깅이 켜져 있음 — 개발 중 콘솔 출력이 장황할 것으로 예상할 것.

## 14. 백엔드 변경 후 권장 검증

1. `./gradlew test` (Docker 데몬 실행 필요 — Testcontainers가 실제 MySQL을 띄움)
2. `./gradlew build`
3. 엔드포인트를 수동으로 테스트할 경우: MySQL이 `localhost:3307/bookmarket`에서 접근 가능한지 확인 후 `./gradlew bootRun` 실행, `http://localhost:8080/swagger-ui/index.html` 확인
4. `SecurityConfig`, `GlobalExceptionHandler`, 또는 DTO 필드명을 건드리는 작업이면 §6에서 언급한 두 위치를 수동으로 다시 확인할 것(통합되어 있지 않음)

## 남은 불확실성 (신뢰하기 전에 확인할 것)

- 3307 포트의 개발용 MySQL을 평소 어떻게 시작/관리하는지(저장소에 docker-compose 없음) — 사용자에게 묻거나 외부 compose 파일 / 로컬 MySQL 서비스가 있는지 확인할 것.
- Swagger UI가 문서화된 기본 경로에서 실제로 접근 가능한지 — 이번 세션에서 실측하지 못함(DB가 꺼져 있었음).
- `server.port`나 다른 속성이 `application.properties` 외부에서(예: `-D` 플래그, `.idea/`의 IDE 실행 구성) 오버라이드되고 있는지 — 확인하지 않음.

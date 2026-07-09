#!/usr/bin/env bash
#
# BookMarket 백엔드 기능 검증 스크립트 (bash + curl + jq)
#
# 이 세션에서 수동으로(브라우저로) 확인한 핵심 플로우를 curl로 그대로 재현합니다:
#   회원가입 -> 로그인 -> 도서 목록/검색/정렬 -> 장바구니 -> 주문 생성 -> 내 주문 내역(페이지네이션)
#   -> 게시판 CRUD -> 관리자 조회 -> 계정 정리
#
# 사용법:
#   ./verify.sh                       # http://localhost:8080 기준으로 실행
#   BASE_URL=http://localhost:8080 ./verify.sh
#
# 요구사항: curl, jq
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
TS="$(date +%s)"
TEST_USER="verify_${TS}"
TEST_PASS="verify1234"

PASS_COUNT=0
FAIL_COUNT=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { PASS_COUNT=$((PASS_COUNT + 1)); echo -e "${GREEN}PASS${NC}  $1"; }
fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); echo -e "${RED}FAIL${NC}  $1"; }
info() { echo -e "${YELLOW}--${NC}    $1"; }

# $1 = jq filter (applied to $BODY), $2 = expected non-empty check description
require() {
  local value
  value="$(echo "$BODY" | jq -r "$1" 2>/dev/null)"
  if [[ -z "$value" || "$value" == "null" ]]; then
    return 1
  fi
  echo "$value"
  return 0
}

# 공통 요청 헬퍼: METHOD PATH [BODY_JSON] [AUTH_TOKEN]
# 결과는 전역 변수 STATUS, BODY 에 담긴다.
req() {
  local method="$1" path="$2" data="${3:-}" token="${4:-}"
  local args=(-s -w '\n%{http_code}' -X "$method" "${BASE_URL}${path}")
  args+=(-H "Content-Type: application/json")
  if [[ -n "$token" ]]; then
    args+=(-H "Authorization: Bearer ${token}")
  fi
  if [[ -n "$data" ]]; then
    args+=(-d "$data")
  fi
  local raw
  raw="$(curl "${args[@]}")"
  STATUS="$(echo "$raw" | tail -n1)"
  BODY="$(echo "$raw" | sed '$d')"
}

echo "BookMarket 백엔드 검증 시작 (BASE_URL=${BASE_URL}, test user=${TEST_USER})"
echo "======================================================================"

# 1. 헬스체크 (Swagger UI 응답)
info "1. 백엔드 헬스체크"
if curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}/swagger-ui/index.html" | grep -q '^200$'; then
  pass "백엔드가 응답합니다 (${BASE_URL})"
else
  fail "백엔드에 연결할 수 없습니다 (${BASE_URL}) — 서버가 켜져 있는지 확인하세요"
  echo "치명적 오류로 중단합니다."
  exit 1
fi

# 2. 회원가입
info "2. 회원가입 (POST /api/auth/signup)"
req POST /api/auth/signup "{\"memberId\":\"${TEST_USER}\",\"password\":\"${TEST_PASS}\",\"name\":\"검증봇\",\"phone\":\"010-0000-0000\",\"email\":\"${TEST_USER}@example.com\",\"address\":\"서울특별시\"}"
if [[ "$STATUS" == "201" ]]; then
  pass "회원가입 성공 (${TEST_USER})"
else
  fail "회원가입 실패 (status=${STATUS}): $BODY"
  exit 1
fi

# 3. 로그인
info "3. 로그인 (POST /api/auth/login)"
req POST /api/auth/login "{\"username\":\"${TEST_USER}\",\"password\":\"${TEST_PASS}\"}"
if [[ "$STATUS" == "200" ]] && ACCESS_TOKEN="$(require '.data.accessToken')"; then
  pass "로그인 성공, 액세스 토큰 발급됨"
else
  fail "로그인 실패 (status=${STATUS}): $BODY"
  exit 1
fi

# 4. 도서 목록 (페이지네이션)
info "4. 도서 목록 조회 (GET /api/book)"
req GET "/api/book?page=0&size=10&sortField=name&sortDir=desc"
TOTAL_BOOKS="$(echo "$BODY" | jq -r '.data.totalElements')"
if [[ "$STATUS" == "200" && "$TOTAL_BOOKS" -gt 0 ]]; then
  pass "도서 ${TOTAL_BOOKS}권, $(echo "$BODY" | jq -r '.data.totalPages')페이지로 응답됨"
else
  fail "도서 목록 조회 실패 (status=${STATUS}): $BODY"
fi

# 5. 제목/저자 검색
info "5. 제목/저자 검색 (GET /api/book?keyword=...)"
req GET "/api/book?page=0&size=20&keyword=%EC%9E%90%EB%B0%94"
SEARCH_COUNT="$(echo "$BODY" | jq -r '.data.totalElements')"
if [[ "$STATUS" == "200" && "$SEARCH_COUNT" -gt 0 ]]; then
  pass "'자바' 검색 결과 ${SEARCH_COUNT}건"
else
  fail "제목/저자 검색 실패 또는 결과 없음 (status=${STATUS}): $BODY"
fi

# 6. 출간일 정렬
info "6. 출간일 정렬 (sortField=releaseDate)"
req GET "/api/book?page=0&size=3&sortField=releaseDate&sortDir=asc"
if [[ "$STATUS" == "200" ]] && FIRST_DATE="$(require '.data.content[0].releaseDate')"; then
  pass "출간일 오름차순 정렬 동작함 (첫 항목: ${FIRST_DATE})"
else
  fail "출간일 정렬 실패 (status=${STATUS}): $BODY"
fi

# 7. 도서 상세 조회 (검색 결과의 첫 책)
info "7. 도서 상세 조회"
req GET "/api/book?page=0&size=1"
BOOK_ID="$(echo "$BODY" | jq -r '.data.content[0].bookId')"
req GET "/api/book/${BOOK_ID}"
if [[ "$STATUS" == "200" ]]; then
  pass "도서 상세 조회 성공 (${BOOK_ID})"
else
  fail "도서 상세 조회 실패 (status=${STATUS}): $BODY"
fi

# 8. 장바구니 담기
info "8. 장바구니 담기 (POST /api/cart/items)"
req POST /api/cart/items "{\"bookId\":\"${BOOK_ID}\",\"quantity\":1}" "$ACCESS_TOKEN"
if [[ "$STATUS" == "201" ]]; then
  pass "장바구니에 담기 성공"
else
  fail "장바구니 담기 실패 (status=${STATUS}): $BODY"
fi

# 9. 장바구니 조회
info "9. 장바구니 조회 (GET /api/cart)"
req GET /api/cart "" "$ACCESS_TOKEN"
CART_ITEM_ID="$(echo "$BODY" | jq -r '.data.items[0].cartItemId')"
if [[ "$STATUS" == "200" && "$CART_ITEM_ID" != "null" ]]; then
  pass "장바구니에 담긴 항목 확인됨 (cartItemId=${CART_ITEM_ID})"
else
  fail "장바구니 조회 실패 (status=${STATUS}): $BODY"
fi

# 10. 주문 생성 (체크아웃)
info "10. 주문 생성 (POST /api/order)"
ORDER_PAYLOAD='{
  "customerName": "검증봇",
  "customerPhone": "010-0000-0000",
  "customerAddress": {"country": "대한민국", "zipcode": "12345", "addressName": "테스트로 1", "detailAddress": "101호"},
  "shippingName": "검증봇",
  "shippingDate": "2026-12-31",
  "shippingAddress": {"country": "대한민국", "zipcode": "12345", "addressName": "테스트로 1", "detailAddress": "101호"}
}'
req POST /api/order "$ORDER_PAYLOAD" "$ACCESS_TOKEN"
if [[ "$STATUS" == "201" ]] && ORDER_ID="$(require '.data.orderId')"; then
  pass "주문 생성 성공 (orderId=${ORDER_ID})"
else
  fail "주문 생성 실패 (status=${STATUS}): $BODY"
fi

# 11. 내 주문 목록 (페이지네이션 확인)
info "11. 내 주문 목록 조회 (GET /api/order/me, 페이지네이션)"
req GET "/api/order/me?page=0&size=5" "" "$ACCESS_TOKEN"
if [[ "$STATUS" == "200" ]] && echo "$BODY" | jq -e '.data.content and (.data.totalElements != null) and (.data.totalPages != null)' >/dev/null 2>&1; then
  pass "내 주문 목록이 페이지네이션 형태로 응답됨 (totalElements=$(echo "$BODY" | jq -r '.data.totalElements'))"
else
  fail "내 주문 목록 페이지네이션 확인 실패 (status=${STATUS}): $BODY"
fi

# 12. 게시글 작성
info "12. 게시글 작성 (POST /api/board)"
req POST /api/board "{\"title\":\"검증 스크립트 테스트 글\",\"content\":\"자동 검증 스크립트가 생성한 게시글입니다.\"}" "$ACCESS_TOKEN"
if [[ "$STATUS" == "201" ]] && BOARD_ID="$(require '.data.id')"; then
  pass "게시글 작성 성공 (id=${BOARD_ID})"
else
  fail "게시글 작성 실패 (status=${STATUS}): $BODY"
fi

# 13. 게시판 목록 (페이지네이션)
info "13. 게시판 목록 조회 (GET /api/board)"
req GET "/api/board?page=0&size=10"
if [[ "$STATUS" == "200" ]]; then
  pass "게시판 목록 조회 성공 (총 $(echo "$BODY" | jq -r '.data.totalElements')건)"
else
  fail "게시판 목록 조회 실패 (status=${STATUS}): $BODY"
fi

# 14. 게시글 수정
info "14. 게시글 수정 (PUT /api/board/{id})"
req PUT "/api/board/${BOARD_ID}" "{\"title\":\"검증 스크립트 테스트 글 (수정됨)\",\"content\":\"수정된 내용입니다.\"}" "$ACCESS_TOKEN"
if [[ "$STATUS" == "200" ]]; then
  pass "게시글 수정 성공"
else
  fail "게시글 수정 실패 (status=${STATUS}): $BODY"
fi

# 15. 게시글 삭제 (정리)
info "15. 게시글 삭제 (DELETE /api/board/{id})"
req DELETE "/api/board/${BOARD_ID}" "" "$ACCESS_TOKEN"
if [[ "$STATUS" == "200" ]]; then
  pass "게시글 삭제 성공 (정리 완료)"
else
  fail "게시글 삭제 실패 (status=${STATUS}): $BODY"
fi

# 16. 관리자 로그인 및 조회
info "16. 관리자 로그인 (admin/admin1234)"
req POST /api/auth/login '{"username":"admin","password":"admin1234"}'
if [[ "$STATUS" == "200" ]] && ADMIN_TOKEN="$(require '.data.accessToken')"; then
  pass "관리자 로그인 성공"
else
  fail "관리자 로그인 실패 — 시드 데이터의 admin 계정이 없나요? (status=${STATUS}): $BODY"
fi

if [[ -n "${ADMIN_TOKEN:-}" ]]; then
  info "16-1. 관리자: 전체 회원 조회"
  req GET /api/member "" "$ADMIN_TOKEN"
  [[ "$STATUS" == "200" ]] && pass "전체 회원 조회 성공 ($(echo "$BODY" | jq -r '.data | length')명)" || fail "전체 회원 조회 실패 (status=${STATUS})"

  info "16-2. 관리자: 전체 주문 조회 (페이지네이션)"
  req GET "/api/order/admin?page=0&size=10" "" "$ADMIN_TOKEN"
  [[ "$STATUS" == "200" ]] && pass "전체 주문 조회 성공 (총 $(echo "$BODY" | jq -r '.data.totalElements')건)" || fail "전체 주문 조회 실패 (status=${STATUS})"
fi

# 17. 테스트 계정 정리 (계정 삭제 -> 장바구니/주문/게시글 cascade 삭제)
info "17. 테스트 계정 정리 (DELETE /api/member/me)"
req DELETE /api/member/me "" "$ACCESS_TOKEN"
if [[ "$STATUS" == "200" ]]; then
  pass "테스트 계정(${TEST_USER}) 삭제 완료"
else
  fail "테스트 계정 삭제 실패 (status=${STATUS}): $BODY"
fi

echo "======================================================================"
echo -e "결과: ${GREEN}${PASS_COUNT} 성공${NC} / ${RED}${FAIL_COUNT} 실패${NC}"
[[ "$FAIL_COUNT" -eq 0 ]] && exit 0 || exit 1

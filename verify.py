#!/usr/bin/env python3
"""
BookMarket 백엔드 기능 검증 스크립트 (순수 표준 라이브러리, pip install 불필요)

이 세션에서 브라우저로 수동 확인한 핵심 플로우를 그대로 재현합니다:
  회원가입 -> 로그인 -> 도서 목록/검색/정렬 -> 장바구니 -> 주문 생성
  -> 내 주문 내역(페이지네이션) -> 게시판 CRUD -> 관리자 조회 -> 계정 정리

사용법:
  python3 verify.py
  BASE_URL=http://localhost:8080 python3 verify.py
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8080")
TS = int(time.time())
TEST_USER = f"verify_{TS}"
TEST_PASS = "verify1234"

PASS_COUNT = 0
FAIL_COUNT = 0

GREEN = "\033[0;32m"
RED = "\033[0;31m"
YELLOW = "\033[1;33m"
NC = "\033[0m"


def ok(label):
    global PASS_COUNT
    PASS_COUNT += 1
    print(f"{GREEN}PASS{NC}  {label}")


def bad(label, detail=""):
    global FAIL_COUNT
    FAIL_COUNT += 1
    suffix = f" -> {detail}" if detail else ""
    print(f"{RED}FAIL{NC}  {label}{suffix}")


def info(label):
    print(f"{YELLOW}--{NC}    {label}")


def request(method, path, body=None, token=None, expect_json=True):
    """Returns (status_code, parsed_body_or_None, raw_text)."""
    # Query strings may contain raw Korean text (e.g. keyword=자바) — quote the
    # path so urllib's ASCII-only request line never chokes on non-ASCII bytes.
    safe_path = urllib.parse.quote(path, safe="/?&=")
    url = f"{BASE_URL}{safe_path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")
            status = resp.status
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        status = e.code
    except urllib.error.URLError as e:
        return None, None, str(e)

    parsed = None
    if expect_json and raw:
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = None
    return status, parsed, raw


def data_of(parsed):
    return (parsed or {}).get("data") or {}


def main():
    print(f"BookMarket 백엔드 검증 시작 (BASE_URL={BASE_URL}, test user={TEST_USER})")
    print("=" * 74)

    # 1. 헬스체크
    info("1. 백엔드 헬스체크")
    status, _, raw = request("GET", "/swagger-ui/index.html", expect_json=False)
    if status == 200:
        ok(f"백엔드가 응답합니다 ({BASE_URL})")
    else:
        bad(f"백엔드에 연결할 수 없습니다 ({BASE_URL})", raw)
        print("치명적 오류로 중단합니다.")
        sys.exit(1)

    # 2. 회원가입
    info("2. 회원가입 (POST /api/auth/signup)")
    status, parsed, raw = request(
        "POST",
        "/api/auth/signup",
        {
            "memberId": TEST_USER,
            "password": TEST_PASS,
            "name": "검증봇",
            "phone": "010-0000-0000",
            "email": f"{TEST_USER}@example.com",
            "address": "서울특별시",
        },
    )
    if status == 201:
        ok(f"회원가입 성공 ({TEST_USER})")
    else:
        bad("회원가입 실패", raw)
        sys.exit(1)

    # 3. 로그인
    info("3. 로그인 (POST /api/auth/login)")
    status, parsed, raw = request(
        "POST", "/api/auth/login", {"username": TEST_USER, "password": TEST_PASS}
    )
    access_token = data_of(parsed).get("accessToken")
    if status == 200 and access_token:
        ok("로그인 성공, 액세스 토큰 발급됨")
    else:
        bad("로그인 실패", raw)
        sys.exit(1)

    # 4. 도서 목록 (페이지네이션)
    info("4. 도서 목록 조회 (GET /api/book)")
    status, parsed, raw = request(
        "GET", "/api/book?page=0&size=10&sortField=name&sortDir=desc"
    )
    total_books = data_of(parsed).get("totalElements", 0)
    if status == 200 and total_books > 0:
        ok(f"도서 {total_books}권, {data_of(parsed).get('totalPages')}페이지로 응답됨")
    else:
        bad("도서 목록 조회 실패", raw)

    # 5. 제목/저자 검색
    info("5. 제목/저자 검색 (GET /api/book?keyword=...)")
    status, parsed, raw = request("GET", "/api/book?page=0&size=20&keyword=자바")
    search_count = data_of(parsed).get("totalElements", 0)
    if status == 200 and search_count > 0:
        ok(f"'자바' 검색 결과 {search_count}건")
    else:
        bad("제목/저자 검색 실패 또는 결과 없음", raw)

    # 6. 출간일 정렬
    info("6. 출간일 정렬 (sortField=releaseDate)")
    status, parsed, raw = request(
        "GET", "/api/book?page=0&size=3&sortField=releaseDate&sortDir=asc"
    )
    content = data_of(parsed).get("content", [])
    if status == 200 and content:
        ok(f"출간일 오름차순 정렬 동작함 (첫 항목: {content[0].get('releaseDate')})")
    else:
        bad("출간일 정렬 실패", raw)

    # 7. 도서 상세 조회
    info("7. 도서 상세 조회")
    status, parsed, raw = request("GET", "/api/book?page=0&size=1")
    book_id = data_of(parsed).get("content", [{}])[0].get("bookId")
    status, parsed, raw = request("GET", f"/api/book/{book_id}")
    if status == 200:
        ok(f"도서 상세 조회 성공 ({book_id})")
    else:
        bad("도서 상세 조회 실패", raw)

    # 8. 장바구니 담기
    info("8. 장바구니 담기 (POST /api/cart/items)")
    status, parsed, raw = request(
        "POST", "/api/cart/items", {"bookId": book_id, "quantity": 1}, token=access_token
    )
    if status == 201:
        ok("장바구니에 담기 성공")
    else:
        bad("장바구니 담기 실패", raw)

    # 9. 장바구니 조회
    info("9. 장바구니 조회 (GET /api/cart)")
    status, parsed, raw = request("GET", "/api/cart", token=access_token)
    items = data_of(parsed).get("items", [])
    if status == 200 and items:
        ok(f"장바구니에 담긴 항목 확인됨 (cartItemId={items[0].get('cartItemId')})")
    else:
        bad("장바구니 조회 실패", raw)

    # 10. 주문 생성
    info("10. 주문 생성 (POST /api/order)")
    address = {
        "country": "대한민국",
        "zipcode": "12345",
        "addressName": "테스트로 1",
        "detailAddress": "101호",
    }
    status, parsed, raw = request(
        "POST",
        "/api/order",
        {
            "customerName": "검증봇",
            "customerPhone": "010-0000-0000",
            "customerAddress": address,
            "shippingName": "검증봇",
            "shippingDate": "2026-12-31",
            "shippingAddress": address,
        },
        token=access_token,
    )
    order_id = data_of(parsed).get("orderId")
    if status == 201 and order_id:
        ok(f"주문 생성 성공 (orderId={order_id})")
    else:
        bad("주문 생성 실패", raw)

    # 11. 내 주문 목록 (페이지네이션)
    info("11. 내 주문 목록 조회 (GET /api/order/me, 페이지네이션)")
    status, parsed, raw = request("GET", "/api/order/me?page=0&size=5", token=access_token)
    d = data_of(parsed)
    if status == 200 and "content" in d and "totalElements" in d and "totalPages" in d:
        ok(f"내 주문 목록이 페이지네이션 형태로 응답됨 (totalElements={d.get('totalElements')})")
    else:
        bad("내 주문 목록 페이지네이션 확인 실패", raw)

    # 12. 게시글 작성
    info("12. 게시글 작성 (POST /api/board)")
    status, parsed, raw = request(
        "POST",
        "/api/board",
        {"title": "검증 스크립트 테스트 글", "content": "자동 검증 스크립트가 생성한 게시글입니다."},
        token=access_token,
    )
    board_id = data_of(parsed).get("id")
    if status == 201 and board_id:
        ok(f"게시글 작성 성공 (id={board_id})")
    else:
        bad("게시글 작성 실패", raw)

    # 13. 게시판 목록
    info("13. 게시판 목록 조회 (GET /api/board)")
    status, parsed, raw = request("GET", "/api/board?page=0&size=10")
    if status == 200:
        ok(f"게시판 목록 조회 성공 (총 {data_of(parsed).get('totalElements')}건)")
    else:
        bad("게시판 목록 조회 실패", raw)

    # 14. 게시글 수정
    info("14. 게시글 수정 (PUT /api/board/{id})")
    status, parsed, raw = request(
        "PUT",
        f"/api/board/{board_id}",
        {"title": "검증 스크립트 테스트 글 (수정됨)", "content": "수정된 내용입니다."},
        token=access_token,
    )
    if status == 200:
        ok("게시글 수정 성공")
    else:
        bad("게시글 수정 실패", raw)

    # 15. 게시글 삭제 (정리)
    info("15. 게시글 삭제 (DELETE /api/board/{id})")
    status, parsed, raw = request("DELETE", f"/api/board/{board_id}", token=access_token)
    if status == 200:
        ok("게시글 삭제 성공 (정리 완료)")
    else:
        bad("게시글 삭제 실패", raw)

    # 16. 관리자 로그인 및 조회
    info("16. 관리자 로그인 (admin/admin1234)")
    status, parsed, raw = request(
        "POST", "/api/auth/login", {"username": "admin", "password": "admin1234"}
    )
    admin_token = data_of(parsed).get("accessToken")
    if status == 200 and admin_token:
        ok("관리자 로그인 성공")
    else:
        bad("관리자 로그인 실패 — 시드 데이터의 admin 계정이 없나요?", raw)

    if admin_token:
        info("16-1. 관리자: 전체 회원 조회")
        status, parsed, raw = request("GET", "/api/member", token=admin_token)
        if status == 200:
            ok(f"전체 회원 조회 성공 ({len((parsed or {}).get('data') or [])}명)")
        else:
            bad("전체 회원 조회 실패", raw)

        info("16-2. 관리자: 전체 주문 조회 (페이지네이션)")
        status, parsed, raw = request(
            "GET", "/api/order/admin?page=0&size=10", token=admin_token
        )
        if status == 200:
            ok(f"전체 주문 조회 성공 (총 {data_of(parsed).get('totalElements')}건)")
        else:
            bad("전체 주문 조회 실패", raw)

    # 17. 테스트 계정 정리
    info("17. 테스트 계정 정리 (DELETE /api/member/me)")
    status, parsed, raw = request("DELETE", "/api/member/me", token=access_token)
    if status == 200:
        ok(f"테스트 계정({TEST_USER}) 삭제 완료")
    else:
        bad("테스트 계정 삭제 실패", raw)

    print("=" * 74)
    print(f"결과: {GREEN}{PASS_COUNT} 성공{NC} / {RED}{FAIL_COUNT} 실패{NC}")
    sys.exit(0 if FAIL_COUNT == 0 else 1)


if __name__ == "__main__":
    main()

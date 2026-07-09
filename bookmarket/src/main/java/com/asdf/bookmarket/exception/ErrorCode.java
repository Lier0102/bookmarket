package com.asdf.bookmarket.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "잘못된 입력값입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),

    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),

    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."),
    DUPLICATE_MEMBER_ID(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "비밀번호가 일치하지 않습니다."),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 일치하지 않습니다."),

    BOOK_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 도서입니다."),
    DUPLICATE_BOOK_ID(HttpStatus.CONFLICT, "이미 등록된 도서입니다."),
    BOOK_OUT_OUF_STOCK(HttpStatus.BAD_REQUEST, "재고가 부족합니다."),

    CART_NOT_FOUND(HttpStatus.NOT_FOUND, "장바구니가 존재하지 않습니다."),
    CART_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "장바구니 항목이 존재하지 않습니다."),
    CART_EMPTY(HttpStatus.BAD_REQUEST, "장바구니가 비어있습니다."),

    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 구문입니다."),

    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 게시글입니다."),
    BOARD_WRITER_MISMATCH(HttpStatus.FORBIDDEN, "게시글 작성자만 수정/삭제할 수 있습니다."),

    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드에 실패했습니다."),
    FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}

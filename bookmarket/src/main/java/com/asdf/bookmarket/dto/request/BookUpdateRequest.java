package com.asdf.bookmarket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@Schema(description = "도서 수정 요청")
public class BookUpdateRequest {
    @NotBlank(message = "도서명을 입력하세요.")
    @Size(min = 4, max = 100, message = "도서명은 4~100자 사이여야 합니다.")
    @Schema(description = "도서명", example = "가상에서 여자친구를 사귀는 방법에 대한 고찰")
    private String name;

    @NotNull(message = "가격을 입력하세요.")
    @Min(value = 0, message = "가격은 0 이상이어야 합니다.")
    @Digits(integer = 8, fraction = 2, message = "가격 형식이 올바르지 않습니다.")
    @Schema(description = "가격", example = "35000")
    private BigDecimal price;

    @Schema(description = "저자", example = "goat")
    private String author;

    @Schema(description = "도서 설명")
    private String description;

    @Schema(description = "출판사", example = "생쥐")
    private String publisher;

    @Schema(description = "분류", example = "IT전문서")
    private String category;

    @NotNull(message = "재고 수량을 입력하세요.")
    @Min(value = 0, message = "재고 수량은 0 이상이어야 합니다.")
    @Schema(description = "재고 수량", example = "100")
    private Long unitInStock;

    @Schema(description = "출판일", example = "2024-01-01")
    private String releaseDate;

    @Schema(description = "도서 상태(new/old/E-book", example = "new")
    private String condition;
}

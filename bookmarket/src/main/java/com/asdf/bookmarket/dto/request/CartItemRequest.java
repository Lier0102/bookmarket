package com.asdf.bookmarket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "장바구니에 넣을 상품???")
public class CartItemRequest {
    @NotBlank(message = "도서 id를 입력")
    @Schema(description = "도서 id", example = "ISBN1234")
    private String bookId;

    @NotNull(message = "수량을 입력")
    @Min(value = 1, message = "수량 1 이상")
    @Schema(description = "수량", example = "2")
    private Integer quantity;
}

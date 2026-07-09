package com.asdf.bookmarket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "주문 생성 요청 (장바구니 기반)")
public class OrderCreateRequest {
    @NotBlank(message = "주문자 이름을 입력하세요.")
    @Schema(description = "주문자 이름", example = "이재원")
    private String customerName;

    @Schema(description = "주문자 전화번호", example = "010-1234-5678")
    private String customerPhone;

    @Valid
    @Schema(description = "주문자 주소")
    private AddressRequest customerAddress;

    @NotBlank(message = "받는 사람 이름을 입력하세요.")
    @Schema(description = "받는 사람 이름", example = "이재원")
    private String shippingName;

    @Schema(description = "배송 희망일", example = "2026-06-20")
    private String shippingDate;

    @Valid
    @Schema(description = "배송 주소")
    private AddressRequest shippingAddress;
}

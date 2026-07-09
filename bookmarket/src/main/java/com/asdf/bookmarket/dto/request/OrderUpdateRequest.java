package com.asdf.bookmarket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "주문 배송 정보 수정 요청")
public class OrderUpdateRequest {
    @Schema(description = "받는 사람 이름", example = "이재원")
    private String shippingName;

    @Schema(description = "배송 희망일", example = "2026-06-20")
    private String shippingDate;

    @Valid
    @Schema(description = "배송 주소")
    private AddressRequest shippingAddress;
}

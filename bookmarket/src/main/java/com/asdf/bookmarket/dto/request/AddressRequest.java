package com.asdf.bookmarket.dto.request;

import com.asdf.bookmarket.entity.Address;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "주소정보")
public class AddressRequest {
    @NotBlank(message = "국가명을 입력하세요.")
    @Schema(description = "국가", example = "대한민국")
    private String country;

    @NotBlank(message = "우편번호를 입력해주세요.")
    @Schema(description = "우편번호", example = "12345")
    private String zipcode;

    @NotBlank(message = "주소를 입력하세요.")
    @Schema(description = "주소", example = "서울시 강남구 테헤란로 1")
    private String addressName;

    @Schema(description = "상세 주소", example = "101동 101호")
    private String detailAddress;

    public Address toEntity() {
        return Address.builder()
            .   country(country)
                .zipcode(zipcode)
                .addressName(addressName)
                .detailName(detailAddress).build();
    }
}

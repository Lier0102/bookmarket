package com.asdf.bookmarket.dto.response;

import com.asdf.bookmarket.entity.Address;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AddrResponse {
    private Long id;
    private String country;
    private String zipcode;
    private String addressName;
    private String detailName;

    public static AddrResponse from(Address address) {
        if (address == null) return null;
        return AddrResponse.builder()
                .id(address.getId())
                .country(address.getCountry())
                .zipcode(address.getZipcode())
                .addressName(address.getAddressName())
                .detailName(address.getDetailName())
                .build();
    }
}

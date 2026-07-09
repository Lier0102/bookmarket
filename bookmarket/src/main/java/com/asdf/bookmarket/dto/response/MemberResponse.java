package com.asdf.bookmarket.dto.response;

import com.asdf.bookmarket.entity.Member;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberResponse {
    private Long id;
    private String memberId;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String role;

    public static MemberResponse from(Member member) {
        return MemberResponse.builder()
                .id(member.getId())
                .memberId(member.getUsername())
                .name(member.getName())
                .phone(member.getPhone())
                .email(member.getEmail())
                .address(member.getAddress())
                .role(member.getRole().name())
                .build();
    }
}

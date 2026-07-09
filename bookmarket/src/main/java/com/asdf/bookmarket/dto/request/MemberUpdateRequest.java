package com.asdf.bookmarket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "회원 정보 수정 요청")
public class MemberUpdateRequest {
    @Schema(description = "이름", example = "이재원")
    private String name;

    @Schema(description = "전화번호", example = "010-1234-5678")
    private String phone;

    @Email(message = "이메일 형식이 올바르지 않습니다.")
    @Schema(description = "이메일", example = "bankai@example.com")
    private String email;

    @Schema(description = "주소", example = "서울시 강남구 테헤란로 1")
    private String address;

    @Schema(description = "새 비밀번호 (변경 시에만 입력, 8~20자)", example = "newpassword123")
    private String newPassword;
}

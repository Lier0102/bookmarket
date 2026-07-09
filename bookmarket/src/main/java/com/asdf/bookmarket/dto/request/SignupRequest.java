package com.asdf.bookmarket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "회원가입 요청")
public class SignupRequest {
    @NotBlank(message = "아이디를 입력하세요.")
    @Size(min = 4, max = 50, message = "아이디는 4~50자 사이여야 합니다.")
    @Schema(description = "로그인 아이디", example = "bankai")
    private String memberId;

    @NotBlank(message = "비밀번호를 입력하세요.")
    @Size(min = 4, max = 100, message = "비밀번호는 4자 이상이어야 합니다.")
    @Schema(description = "비밀번호", example = "1234")
    private String password;

    @NotBlank(message = "이름을 입력하세요.")
    @Schema(description = "이름", example = "이재원")
    private String name;

    @Schema(description = "전화번호", example = "010-1234-5678")
    private String phone;

    @Email(message = "이메일 형식이 올바르지 않습니다.")
    @Schema(description = "이메일", example = "bankai@example.com")
    private String email;

    @Schema(description = "주소", example = "서울시 강남구 테헤란로 1")
    private String address;
}

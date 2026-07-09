package com.asdf.bookmarket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Schema(description = "로그인 요청")
public class LoginRequest {
    private String username;
    private String password;
}

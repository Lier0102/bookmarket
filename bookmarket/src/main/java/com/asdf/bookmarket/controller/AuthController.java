package com.asdf.bookmarket.controller;

import com.asdf.bookmarket.dto.request.LoginRequest;
import com.asdf.bookmarket.dto.request.SignupRequest;
import com.asdf.bookmarket.dto.response.ApiResponse;
import com.asdf.bookmarket.dto.response.MemberResponse;
import com.asdf.bookmarket.dto.response.TokenResponse;
import com.asdf.bookmarket.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    @Operation(summary = "회원가입", description = "새로운 회원 등록")
    public ResponseEntity<ApiResponse<MemberResponse>> signup(
            @Valid @RequestBody SignupRequest request) {
        MemberResponse response = authService.signup(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "로그인(id/pw) 후 jwt 발급")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);

        return ResponseEntity.ok(ApiResponse.success("로그인 성공", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "토큰 갱신", description = "refresh token으로 다시 토큰 가져옴")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @RequestHeader("Authorization") String bearerToken) {
        String refreshToken = bearerToken.replace("Bearer ", "");

        TokenResponse response = authService.refresh(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("토큰 갱신 완료", response));
    }


}

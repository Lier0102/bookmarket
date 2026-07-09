package com.asdf.bookmarket.controller;

import com.asdf.bookmarket.dto.request.BookCreateRequest;
import com.asdf.bookmarket.dto.request.BookUpdateRequest;
import com.asdf.bookmarket.dto.request.MemberUpdateRequest;
import com.asdf.bookmarket.dto.response.ApiResponse;
import com.asdf.bookmarket.dto.response.BookResponse;
import com.asdf.bookmarket.dto.response.MemberResponse;
import com.asdf.bookmarket.security.CustomerUserDetails;
import com.asdf.bookmarket.service.BookService;
import com.asdf.bookmarket.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
@SecurityRequirement(name = "bearerAuth")
public class MemberController {
    private final MemberService memberService;
    private final BookService bookService;


    @Operation(summary = "view my info", description = "lookup my info's")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberResponse>> getMyInfo(
            @AuthenticationPrincipal CustomerUserDetails userDetails) {
        MemberResponse response = memberService.getMemberById(userDetails.getUsername());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "회원 정보 수정", description = "erm what should I write down here..")
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<MemberResponse>> updateMyInfo(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @Valid @RequestBody MemberUpdateRequest request) {
        MemberResponse response = memberService.updateMember(userDetails.getUsername(), request);

        return ResponseEntity.ok(ApiResponse.success("edited user info's succ", response));
    }

    @Operation(summary = "회원 탈퇴", description = "acc 삭제")
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteMyAccount(
            @AuthenticationPrincipal CustomerUserDetails userDetails) {
        memberService.deleteMember(userDetails.getUsername());

        return ResponseEntity.ok(ApiResponse.noContent());
    }

    @Operation(summary = "관리자로 전체 회원 조회", description = "ROLE admin필요")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getAllMembers(
            @AuthenticationPrincipal CustomerUserDetails userDetails) {
        List<MemberResponse> responses = memberService.getAllMembers();

        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}

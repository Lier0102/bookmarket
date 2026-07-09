package com.asdf.bookmarket.controller;

import com.asdf.bookmarket.dto.request.BoardRequest;
import com.asdf.bookmarket.dto.response.ApiResponse;
import com.asdf.bookmarket.dto.response.BoardResponse;
import com.asdf.bookmarket.dto.response.PageResponse;
import com.asdf.bookmarket.entity.Board;
import com.asdf.bookmarket.security.CustomerUserDetails;
import com.asdf.bookmarket.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/board")
public class BoardController {
    private final BoardService boardService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BoardResponse>>> getBoardList(
            @Parameter(description = "page num", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "size of page")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "sortField", example = "createdDate")
            @RequestParam(defaultValue = "createdDate") String sortField,
            @Parameter(description = "sort direction", example = "asc")
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                boardService.getBoardList(page, size, sortField, sortDir)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BoardResponse>> getBoardById(
            @Parameter(description = "") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(boardService.getBoardById(id)));
    }

    @Operation(summary = "게시글 작성",
    security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<BoardResponse>> createBoard(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @Valid @RequestBody BoardRequest request
            ) {
        BoardResponse response = boardService.createBoard(userDetails.getUsername(), request);

        return  ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @Operation(summary = "게ㅣ글 수정")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BoardResponse>> updateBoard(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @Valid @RequestBody BoardRequest request,
            @PathVariable Long id) {
        BoardResponse response = boardService.updateBoard(id, userDetails.getUsername(), request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "게시글 삭제", description = "ㅇㅇ..")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBoard(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @PathVariable Long id) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        boardService.deleteBoard(id, userDetails.getUsername(), isAdmin);

        return ResponseEntity.ok(ApiResponse.noContent());
    }
}

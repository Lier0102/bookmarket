package com.asdf.bookmarket.controller;

import com.asdf.bookmarket.dto.request.BookImageUploadRequest;
import com.asdf.bookmarket.dto.response.ApiResponse;
import com.asdf.bookmarket.dto.response.BookResponse;
import com.asdf.bookmarket.dto.response.PageResponse;
import com.asdf.bookmarket.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/book")
public class BookController {
    private final BookService bookService;

    @Operation(summary = "get all books with pagination", description = "yippy")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getAllBooks(
            @Parameter(description = "페이지 번호(0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 기준 필드", example = "name")
            @RequestParam(defaultValue = "name") String sortField,
            @Parameter(description = "정렬 방향", example = "desc")
            @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "제목 또는 저자 이름 검색어 (선택)", example = "자바")
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success(
                bookService.getAllBooks(page, size, sortField, sortDir, keyword)
        ));
    }

    @Operation(summary = "get books by category", description = "regex filter")
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getBooksByCategory(
        @Parameter(description = "category name", example = "IT")
        @PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.success(
                bookService.getBooksByCategory(category)
        ));
    }

    @Operation(summary = "search books by filtering", description = "publisher, category")
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getBooksByFilter(
        @Parameter(description = "publisher(optional)", example = "ang media")
        @RequestParam(required = false) String publisher,
        @Parameter(description = "category (optional)", example = "IT")
        @RequestParam(required = false) String category) {
        return ResponseEntity.ok(ApiResponse.success(
                bookService.getBooksByFilter(publisher, category)
        ));
    }

    @Operation(summary = "get book by ISBN", description = "same as summary that I wrote")
    @GetMapping("{bookId}")
    public ResponseEntity<ApiResponse<BookResponse>> getBookById(
            @Parameter(description = "book ID", example = "ISBN1234")
            @PathVariable String bookId) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getBookById(bookId)));
    }

    @PostMapping(value = "/{bookId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookResponse>> uploadBookImage(
            @PathVariable String bookId,
            @ModelAttribute BookImageUploadRequest request) {

        BookResponse response = bookService.uploadBookImage(bookId, request.getImageFile());
        return ResponseEntity.ok(ApiResponse.success("image was uploaded successfully",
                response));
    }

    @GetMapping("/{bookId}/image")
    public ResponseEntity<Resource> getBookImage(
            @PathVariable String bookId) {
        Resource resource = bookService.getBookImage(bookId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() +"\"")
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
}

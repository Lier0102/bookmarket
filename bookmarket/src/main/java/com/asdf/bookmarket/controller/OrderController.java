package com.asdf.bookmarket.controller;

import com.asdf.bookmarket.dto.request.OrderCreateRequest;
import com.asdf.bookmarket.dto.request.OrderUpdateRequest;
import com.asdf.bookmarket.dto.response.ApiResponse;
import com.asdf.bookmarket.dto.response.OrderResponse;
import com.asdf.bookmarket.dto.response.PageResponse;
import com.asdf.bookmarket.entity.Order;
import com.asdf.bookmarket.security.CustomerUserDetails;
import com.asdf.bookmarket.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {
    private final OrderService orderService;

    @Operation(summary = "create order", description = "after order, cart would be cleared")
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @Valid @RequestBody OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(userDetails.getUsername(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @Operation(summary = "view my orders", description = "when log-in'd, paginated")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortField,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<OrderResponse> response = orderService.getMyOrders(
                userDetails.getUsername(), page, size, sortField, sortDir);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "view my order in detail", description = "yeee")
    @GetMapping("/me/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getMyOrder(
        @AuthenticationPrincipal CustomerUserDetails userDetails,
        @Parameter(description = "order ID") @PathVariable Long orderId
    ) {
        OrderResponse response = orderService.getMyOrder(userDetails.getUsername(), orderId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "get all orders from every user", description = "by pagination")
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderId") String sortField,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<OrderResponse> response = orderService.getAllOrders(page, size, sortField, sortDir);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "order inspection (admin only)", description = "get specific order inspected")
    @GetMapping("/admin/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @Parameter(description = "order ID") @PathVariable Long orderId) {
        OrderResponse response = orderService.getOrderById(orderId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "edit order", description = "배송 정보 수정")
    @PutMapping("/admin/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(
            @Parameter(description = "order ID") @PathVariable Long orderId,
            @Valid @RequestBody OrderUpdateRequest request) {
        OrderResponse response = orderService.updateOrder(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("order updated", response));
    }

    @Operation(summary = "특정 주문 삭제 (admin only)")
    @DeleteMapping("/admin/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(
            @Parameter(description = "order ID") @PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.ok(ApiResponse.noContent());
    }

    @Operation(summary = "delete all orders (admin only)")
    @DeleteMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAllOrders() {
        orderService.deleteAllOrders();
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}

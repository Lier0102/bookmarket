package com.asdf.bookmarket.controller;

import com.asdf.bookmarket.dto.request.CartItemRequest;
import com.asdf.bookmarket.dto.response.ApiResponse;
import com.asdf.bookmarket.dto.response.CartResponse;
import com.asdf.bookmarket.security.CustomerUserDetails;
import com.asdf.bookmarket.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
@SecurityRequirement(name = "bearerAuth")
public class CartController {
    private final CartService cartService;

    @Operation(summary = "check my cart", description = "when log-in'd")
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getMyCart(
            @AuthenticationPrincipal CustomerUserDetails userDetails) {
        CartResponse response = cartService.getMyCart(userDetails.getUsername());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "add CartItem to Cart", description = "modify count when the target is existing item(s)")
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addCartItem(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @Valid @RequestBody CartItemRequest request) {
        CartResponse response = cartService.addCartItem(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @Operation(summary = "modify specific cartItem", description = "asdf")
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @Parameter(description = "cartItem ID") @PathVariable Long cartItemId,
            @Parameter(description = "itemCount", example = "3")
            @RequestParam int quantity) {
        CartResponse response = cartService.updateCartItem(userDetails.getUsername(), cartItemId, quantity);
        return ResponseEntity.ok(ApiResponse.success("updated cartItem", response));
    }

    @Operation(summary = "remove a cartItem", description = "..")
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @Parameter(description = "cartItem ID") @PathVariable Long cartItemId) {
        CartResponse response = cartService.removeCartItem(userDetails.getUsername(), cartItemId);

        return ResponseEntity.ok(ApiResponse.success("removed cartItem", response));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal CustomerUserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return  ResponseEntity.ok(ApiResponse.noContent());
    }
}

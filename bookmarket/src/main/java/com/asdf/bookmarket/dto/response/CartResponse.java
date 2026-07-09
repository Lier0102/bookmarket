package com.asdf.bookmarket.dto.response;

import com.asdf.bookmarket.entity.Cart;
import com.asdf.bookmarket.entity.CartItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class CartResponse {
    private Long cartId;
    private String memberId;
    private List<CartItemResponse> items;
    private int totalQuantity;
    private BigDecimal grandTotal;

    public static CartResponse from(Cart cart) {
        List<CartItemResponse> items = cart.getCartItems().stream()
                .map(CartItemResponse::from)
                .toList();
        int totalQuantity = cart.getCartItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
        return CartResponse.builder()
                .cartId(cart.getId())
                .memberId(cart.getMember().getUsername())
                .items(items)
                .totalQuantity(totalQuantity)
                .grandTotal(cart.getGrandTotal())
                .build();
    }
}

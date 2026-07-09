package com.asdf.bookmarket.dto.response;

import com.asdf.bookmarket.entity.CartItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class CartItemResponse {
    private Long cartItemId;
    private String bookId;
    private String bookName;
    private BigDecimal price;
    private int quantity;
    private BigDecimal totalPrice;
    private String imageUrl;

    public static CartItemResponse from(CartItem cartItem) {
        return CartItemResponse.builder()
                .cartItemId(cartItem.getId())
                .bookId(cartItem.getBook().getBookId())
                .bookName(cartItem.getBook().getName())
                .price(cartItem.getBook().getUnitPrice())
                .quantity(cartItem.getQuantity())
                .totalPrice(cartItem.getTotalPrice())
                .imageUrl(cartItem.getBook().getFileName() != null
                        ? "/api/books/" + cartItem.getBook().getBookId() + "/image"
                        : null)
                .build();
    }
}

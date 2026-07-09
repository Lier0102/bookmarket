package com.asdf.bookmarket.dto.response;

import com.asdf.bookmarket.entity.OrderItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class OrderItemResponse {
    private Long id;
    private String bookId;
    private String bookName;
    private Integer quantity;
    private BigDecimal totalPrice;

    public static OrderItemResponse from(OrderItem orderItem) {
        return OrderItemResponse.builder()
                .id(orderItem.getId())
                .bookId(orderItem.getBook() != null ? orderItem.getBook().getBookId() : null)
                .bookName(orderItem.getBookName())
                .quantity(orderItem.getQuantity())
                .totalPrice(orderItem.getTotalPrice())
                .build();
    }
}

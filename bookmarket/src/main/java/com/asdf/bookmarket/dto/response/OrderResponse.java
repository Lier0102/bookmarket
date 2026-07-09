package com.asdf.bookmarket.dto.response;

import com.asdf.bookmarket.entity.Order;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {
    private Long orderId;
    private String memberId;
    private String customerName;
    private String customerPhone;
    private AddrResponse customerAddress;
    private String shippingName;
    private String shippingDate;
    private AddrResponse shippingAddress;
    private List<OrderItemResponse> items;
    private BigDecimal grandTotal;
    private LocalDateTime createdDate;

    public static OrderResponse from(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(OrderItemResponse::from)
                .toList();
        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .memberId(order.getMember().getUsername())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .customerAddress(AddrResponse.from(order.getCustomerAddress()))
                .shippingName(order.getShippingName())
                .shippingDate(order.getShippingDate())
                .shippingAddress(AddrResponse.from(order.getShippingAddress()))
                .items(items)
                .grandTotal(order.getGrandTotal())
                .createdDate(order.getCreatedDate())
                .build();
    }
}

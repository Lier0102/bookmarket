package com.asdf.bookmarket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "total_price", precision = 12, scale = 2)
    private BigDecimal totalPrice;

    public void updateQuantity(int quantity) {
        this.quantity = quantity;
        this.totalPrice = book.getUnitPrice().multiply(BigDecimal.valueOf(quantity));
    }

    public static CartItem createCartItem(Cart cart, Book book, int quantity) {;
        return CartItem.builder()
                .cart(cart)
                .book(book)
                .quantity(quantity)
                .totalPrice(book.getUnitPrice().multiply(BigDecimal.valueOf(quantity)))
                .build();
    }
}

package com.asdf.bookmarket.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "books")
public class Book {
    @Id
    @Column(name = "book_id", length = 10)
    private String bookId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(length = 100)
    private String author;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String publisher;

    @Column(length = 50)
    private String category;

    @Column(name = "units_in_stock", nullable = false)
    private Long unitsInStock;

    public void decreaseStock(int quantity) {
        long remaining = (unitsInStock == null ? 0L : unitsInStock) - quantity;
        if (remaining < 0) {
            throw new IllegalStateException("재고가 부족합니다.");
        }
        this.unitsInStock = remaining;
    }

    @Column(name = "release_date", length = 20)
    private String releaseDate;

    @Column(name = "book_condition", length = 20)
    private String bookCondition;

    @Column(name = "file_name", length = 100)
    private String fileName;
}

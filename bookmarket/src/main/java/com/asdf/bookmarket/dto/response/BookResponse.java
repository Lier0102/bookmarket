package com.asdf.bookmarket.dto.response;

import com.asdf.bookmarket.entity.Book;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class BookResponse {
    private String bookId;
    private String name;
    private BigDecimal unitPrice;
    private String author;
    private String description;
    private String publisher;
    private String category;
    private Long unitsInStock;
    private String releaseDate;
    private String bookCondition;
    private String fileName;

    public static BookResponse from(Book book) {
        return BookResponse.builder()
                .bookId(book.getBookId())
                .name(book.getName())
                .unitPrice(book.getUnitPrice())
                .author(book.getAuthor())
                .description(book.getDescription())
                .publisher(book.getPublisher())
                .category(book.getCategory())
                .unitsInStock(book.getUnitsInStock())
                .releaseDate(book.getReleaseDate())
                .bookCondition(book.getBookCondition())
                .fileName(book.getFileName())
                .build();
    }
}

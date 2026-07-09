package com.asdf.bookmarket.repository;

import com.asdf.bookmarket.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, String> {
    Page<Book> findByCategoryContainingIgnoreCase(String name, Pageable pageable);

    List<Book> findByCategoryContainingIgnoreCase(String category);

    // 제목 또는 저자 이름에 키워드가 포함된 도서 검색 (대소문자 무시)
    Page<Book> findByNameContainingIgnoreCaseOrAuthorContainingIgnoreCase(
            String name, String author, Pageable pageable);

    List<Book> findByPublisherContainingIgnoreCase(String publisher);

    @Query("SELECT b FROM Book b "
            + "WHERE (:publisher IS NULL OR LOWER(b.publisher) LIKE LOWER(CONCAT('%', :publisher, '%'))) "
            + "AND (:category IS NULL OR LOWER(b.category) LIKE LOWER(CONCAT('%', :category, '%')))")
    List<Book> findByFilter(@Param("publisher") String publisher, @Param("category") String category);
}

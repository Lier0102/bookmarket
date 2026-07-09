package com.asdf.bookmarket.repository;

import com.asdf.bookmarket.entity.Book;
import com.asdf.bookmarket.entity.Cart;
import com.asdf.bookmarket.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndBook_bookId(Cart cart, String bookId);
}

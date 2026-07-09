package com.asdf.bookmarket.repository;

import com.asdf.bookmarket.entity.Cart;
import com.asdf.bookmarket.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByMember(Member member);

    @Query("SELECT DISTINCT c FROM Cart c "
            + "LEFT JOIN FETCH c.cartItems ci "
            + "LEFT JOIN FETCH ci.book "
            + "WHERE c.member = :member")
    Optional<Cart> findByMemberWithItems(@Param("member") Member member);
}

package com.asdf.bookmarket.repository;

import com.asdf.bookmarket.entity.Member;
import com.asdf.bookmarket.entity.Order;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByMemberOrderByCreatedDateDesc(Member member);

    Page<Order> findByMember(Member member, Pageable pageable);

    Optional<Order> findByOrderIdAndMember(Long id, Member member);

    @NonNull
    Page<Order> findAll(@NonNull Pageable pageable);

    // 주문 상세를 연관 엔티티까지 한 번에 로딩(N+1 방지). 컬렉션 fetch join이라 DISTINCT로 루트 중복 제거.
    @Query("SELECT DISTINCT o FROM Order o "
            + "LEFT JOIN FETCH o.orderItems oi "
            + "LEFT JOIN FETCH oi.book "
            + "LEFT JOIN FETCH o.member "
            + "LEFT JOIN FETCH o.customerAddress "
            + "LEFT JOIN FETCH o.shippingAddress "
            + "WHERE o.orderId = :orderId")
    Optional<Order> findByIdWithDetails(@Param("orderId") Long orderId);
}

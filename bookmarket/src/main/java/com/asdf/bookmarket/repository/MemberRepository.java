package com.asdf.bookmarket.repository;

import com.asdf.bookmarket.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    // 로그인 아이디(memberId)로 회원을 조회함. Member 엔티티에는 username 필드가 없어 memberId에 매핑함.
    @Query("SELECT m FROM Member m WHERE m.username = :username")
    Optional<Member> findByUsername(@Param("username") String username);

    boolean existsByUsername(String memberId);
}

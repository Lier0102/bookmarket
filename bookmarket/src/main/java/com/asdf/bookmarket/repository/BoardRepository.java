package com.asdf.bookmarket.repository;

import com.asdf.bookmarket.entity.Board;
import com.asdf.bookmarket.entity.Member;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    @NonNull
    Page<Board> findAll(@NonNull Pageable pageable);

    // 회원 탈퇴 시 해당 회원이 작성한 게시글을 함께 삭제 (boards.member_id FK 정리)
    void deleteByMember(Member member);
}

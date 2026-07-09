package com.asdf.bookmarket.service;

import com.asdf.bookmarket.dto.request.MemberUpdateRequest;
import com.asdf.bookmarket.dto.request.SignupRequest;
import com.asdf.bookmarket.dto.response.MemberResponse;
import com.asdf.bookmarket.entity.Member;
import com.asdf.bookmarket.entity.Role;
import com.asdf.bookmarket.exception.BusinessException;
import com.asdf.bookmarket.exception.ErrorCode;
import com.asdf.bookmarket.repository.BoardRepository;
import com.asdf.bookmarket.repository.CartRepository;
import com.asdf.bookmarket.repository.MemberRepository;
import com.asdf.bookmarket.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// 회원 가입/조회/수정/삭제 규칙 처리함.
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final BoardRepository boardRepository;

    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public MemberResponse getMemberById(String memberId) {
        Member member = findMemberByMemberId(memberId);
        return MemberResponse.from(member);
    }

    @Transactional
    public MemberResponse updateMember(String memberId, MemberUpdateRequest request) {
        Member member = findMemberByMemberId(memberId);

        member.setName(request.getName());
        member.setPhone(request.getPhone());
        member.setEmail(request.getEmail());
        member.setAddress(request.getAddress());

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            member.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        log.info("member updated: {}", member);
        return MemberResponse.from(member);
    }

    @Transactional
    public void deleteMember(String memberId) {
        Member member = findMemberByMemberId(memberId);

        // 회원을 FK로 참조하는 자식 데이터를 먼저 정리해야 FK 제약 위반(500) 없이 삭제된다.
        // 장바구니(1:1) — cart_items는 Cart의 cascade/orphanRemoval로 함께 삭제됨
        cartRepository.findByMember(member).ifPresent(cartRepository::delete);
        // 주문(1:N) — order_items, addresses는 Order의 cascade로 함께 삭제됨
        orderRepository.deleteAll(orderRepository.findByMemberOrderByCreatedDateDesc(member));
        // 게시글(boards) — member_id FK로 회원을 참조하므로 함께 삭제
        boardRepository.deleteByMember(member);

        memberRepository.delete(member);

        log.info("member deleted: {}", member);
    }

    @Transactional
    public List<MemberResponse> getAllMembers() {
        return memberRepository.findAll().stream().map(MemberResponse::from).toList();
    }

    public Member findMemberByMemberId(String memberId) {
        return memberRepository.findByUsername(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
    }
}

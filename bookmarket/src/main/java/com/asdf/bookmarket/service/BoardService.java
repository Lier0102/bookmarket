package com.asdf.bookmarket.service;

import com.asdf.bookmarket.dto.request.BoardRequest;
import com.asdf.bookmarket.dto.response.BoardResponse;
import com.asdf.bookmarket.dto.response.PageResponse;
import com.asdf.bookmarket.entity.Board;
import com.asdf.bookmarket.entity.Member;
import com.asdf.bookmarket.exception.BusinessException;
import com.asdf.bookmarket.exception.ErrorCode;
import com.asdf.bookmarket.repository.BoardRepository;
import com.asdf.bookmarket.repository.BookRepository;
import com.asdf.bookmarket.repository.MemberRepository;
import jakarta.transaction.TransactionScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// 게시판 글 작성/조회/수정/삭제 규칙 처리함.
@Service
@Slf4j
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;

    private final MemberService memberService;

    @Transactional(readOnly = true)
    public PageResponse<BoardResponse> getBoardList(int page, int size, String sortField, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortField).descending()
                : Sort.by(sortField).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<BoardResponse> boardPage = boardRepository.findAll(pageable).map(BoardResponse::from);
        return PageResponse.of(boardPage);
    }

    @Transactional(readOnly = true)
    public BoardResponse getBoardById(Long id) {
        Board board = findBoardById(id);

        return BoardResponse.from(board);
    }

    @Transactional
    public BoardResponse createBoard(String memberId, BoardRequest boardRequest) {
        Member member = memberService.findMemberByMemberId(memberId);
        Board board = Board.builder()
                .member(member)
                .title(boardRequest.getTitle())
                .content(boardRequest.getContent())
                .build();

        Board savedBoard = boardRepository.save(board);
        log.info("Board created: {}", savedBoard.getId());
        return BoardResponse.from(savedBoard);
    }

    @Transactional
    public BoardResponse updateBoard(Long id, String memberId, BoardRequest boardRequest) {
        Board board = findBoardById(id);

        if (!board.getMember().getUsername().equals(memberId)) {
            throw new BusinessException(ErrorCode.BOARD_WRITER_MISMATCH);
        }

        board.setTitle(boardRequest.getTitle());
        board.setContent(boardRequest.getContent());
        log.info("Board updated: {}", board.getId());

        return BoardResponse.from(board);
    }

    @Transactional
    public void deleteBoard(Long id, String memberId, boolean isAdmin) {
        Board board = findBoardById(id);

        // admin 이거나 당사자만 삭제 가능 (관리자가 아니고 작성자도 아니면 거부)
        if (!isAdmin && !board.getMember().getUsername().equals(memberId)) {
            throw new BusinessException(ErrorCode.BOARD_WRITER_MISMATCH);
        }

        boardRepository.deleteById(id);
        log.info("Board deleted: {}", id);
    }

    private Board findBoardById(Long id) {
        return boardRepository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
    }
}
package com.asdf.bookmarket.dto.response;

import com.asdf.bookmarket.entity.Board;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BoardResponse {
    private Long id;
    private String writerId;
    private String writerName;
    private String title;
    private String content;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

    public static BoardResponse from(Board board) {
        return BoardResponse.builder()
                .id(board.getId())
                .writerId(board.getMember().getUsername())
                .writerName(board.getMember().getName())
                .title(board.getTitle())
                .content(board.getContent())
                .createdDate(board.getCreatedDate())
                .modifiedDate(board.getModifiedDate())
                .build();
    }
}

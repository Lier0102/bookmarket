package com.asdf.bookmarket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "게시글 요청")
public class BoardRequest {
    @NotBlank(message = "제목을 입력하세요.")
    @Size(max = 200, message = "제목은 200자 이내로 입력하세요.")
    @Schema(description = "게사글 제목", example = "스프링 부트 RESTFul API 질문입니다.")
    private String title;

    @NotBlank(message = "내용을 입력하세요.")
    @Schema(description = "게시글 내용", example = "궁금하다. 너의. 응가.")
    private String content;
}

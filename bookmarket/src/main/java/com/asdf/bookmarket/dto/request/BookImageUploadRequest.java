package com.asdf.bookmarket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "book image upload request(multipart/form-data")
public class BookImageUploadRequest {
    @Schema(description = "업로드할 이미지 파일", type = "String", format = "binary")
    private MultipartFile imageFile;
}

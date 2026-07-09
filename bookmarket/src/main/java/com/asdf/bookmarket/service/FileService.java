package com.asdf.bookmarket.service;

import com.asdf.bookmarket.exception.BusinessException;
import com.asdf.bookmarket.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Slf4j
@Service
public class FileService {
    private final Path uploadPath;
    public FileService(@Value("${app.upload.path}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize(); // 상대경로를 절대경로로 정리

        try {
            Files.createDirectories(this.uploadPath);
            log.info("upload dir created: {}", this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create dir: " + this.uploadPath, e);
        }
    }

    public String saveFile(MultipartFile file, String fileName) {
        try {
            Path targetPath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("file uploaded: {}", targetPath);

            return fileName;
        } catch (IOException e) {
            log.error("Could not upload file: {}", fileName, e);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path targetPath = uploadPath.resolve(fileName);
            Resource resource = new UrlResource(targetPath.toUri());

            if (resource.exists()) {
                return resource;
            }
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }  catch (MalformedURLException e) {
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }
    }

    public void deleteFile(String fileName) {
        if (fileName == null ||  fileName.isBlank()) {
            return;
        }

        try {
            Path filePath = uploadPath.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete file: {}", fileName, e);
        }
    }
}

package com.asdf.bookmarket.service;

import com.asdf.bookmarket.dto.request.BookCreateRequest;
import com.asdf.bookmarket.dto.request.BookUpdateRequest;
import com.asdf.bookmarket.dto.response.BookResponse;
import com.asdf.bookmarket.dto.response.PageResponse;
import com.asdf.bookmarket.entity.Book;
import com.asdf.bookmarket.exception.BusinessException;
import com.asdf.bookmarket.exception.ErrorCode;
import com.asdf.bookmarket.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

// 도서 등록/조회/수정/삭제 규칙 처리함.
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository; // 책 가져오려고
    private final FileService fileService; // 얜 파일업로드/다운로드 쪽 아닌가

    @Transactional(readOnly = true) //
    public PageResponse<BookResponse> getAllBooks(int page, int size, String sortField, String sortDir, String keyword) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortField).descending()
                : Sort.by(sortField).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Book> books = (keyword == null || keyword.isBlank())
                ? bookRepository.findAll(pageable)
                : bookRepository.findByNameContainingIgnoreCaseOrAuthorContainingIgnoreCase(keyword, keyword, pageable);

        return PageResponse.of(books.map(BookResponse::from));
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getBooksByCategory(String category) {
        List<Book> books = bookRepository.findByCategoryContainingIgnoreCase(category);

        if (books.isEmpty()) {
            throw new BusinessException(ErrorCode.BOOK_NOT_FOUND,
                    "'" + category + "' is not found");
        }

        return books.stream().map(BookResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getBooksByFilter(String publisher, String category) {
        return bookRepository.findByFilter(publisher, category).stream().map(BookResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookResponse getBookById(String bookId) {
        Book book = findBookById(bookId);
        return BookResponse.from(book);
    }

    @Transactional
    public BookResponse createBook(BookCreateRequest request, MultipartFile imageFile) {
        if (bookRepository.existsById(request.getBookId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_BOOK_ID);
        }

        String fileName = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            fileName = request.getBookId() + "_" + imageFile.getOriginalFilename();
            fileService.saveFile(imageFile, fileName);
        }

        Book book = Book.builder()
                .bookId(request.getBookId())
                .name(request.getName())
                .unitPrice(request.getPrice())
                .author(request.getAuthor())
                .description(request.getDescription())
                .publisher(request.getPublisher())
                .category(request.getCategory())
                .unitsInStock(request.getUnitInStock())
                .releaseDate(request.getReleaseDate())
                .bookCondition(request.getCondition())
                .fileName(fileName)
                .build();

        Book savedBook = bookRepository.save(book);
        log.info("book added: {}", savedBook.getBookId());
        return BookResponse.from(savedBook);
    }

    @Transactional
    public BookResponse updateBook(String bookId,BookUpdateRequest request, MultipartFile imageFile) {
        Book book = findBookById(bookId);

        book.setName(request.getName());
        book.setDescription(request.getDescription());
        book.setAuthor(request.getAuthor());
        book.setCategory(request.getCategory());
        book.setBookCondition(request.getCondition());
        book.setPublisher(request.getPublisher());
        book.setUnitPrice(request.getPrice());
        book.setUnitsInStock(request.getUnitInStock());
        book.setReleaseDate(request.getReleaseDate());

        if (imageFile != null && !imageFile.isEmpty()) {
            fileService.deleteFile(book.getFileName());

            String newFileName = bookId + "_" + imageFile.getOriginalFilename();
            fileService.saveFile(imageFile, newFileName);

            book.setFileName(newFileName);
        }
        log.info("book updated: {}", bookId);

        return BookResponse.from(book);
    }

    @Transactional
    public void deleteBook(String bookId) {
        Book book = findBookById(bookId);

        fileService.deleteFile(book.getFileName());
        bookRepository.delete(book);

        log.info("book deleted: {}", bookId);
    }

    @Transactional
    public BookResponse uploadBookImage(String bookId, MultipartFile imageFile) {
        Book book = findBookById(bookId);
        fileService.deleteFile(book.getFileName());

        String newFileName = bookId + "_" + imageFile.getOriginalFilename();
        fileService.saveFile(imageFile, newFileName);

        book.setFileName(newFileName);

        log.info("book image uploaded: {}", bookId);
        return BookResponse.from(book);
    }

    public Resource getBookImage(String bookId) {
        Book book = findBookById(bookId);

        if (book.getFileName() == null) {
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }

        return fileService.loadFileAsResource(book.getFileName());
    }

    public Book findBookById(String bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOK_NOT_FOUND));
    }
}

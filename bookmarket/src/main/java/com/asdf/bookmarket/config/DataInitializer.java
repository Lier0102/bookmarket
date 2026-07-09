package com.asdf.bookmarket.config;

import com.asdf.bookmarket.entity.Book;
import com.asdf.bookmarket.entity.Member;
import com.asdf.bookmarket.entity.Role;
import com.asdf.bookmarket.repository.BookRepository;
import com.asdf.bookmarket.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {
    private final MemberRepository memberRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        initMember();
        initBook();
        initMoreBooks();
    }

    private void initMember() {
        if (memberRepository.count() > 0) return;

        memberRepository.save(Member.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin1234"))
                .name("관리자")
                .phone("010-1234-5678")
                .email("admin@bookmarket.com")
                .address("경상북도 의성군")
                .role(Role.ADMIN)
                .build());

        memberRepository.save(Member.builder()
                .username("user01")
                .password(passwordEncoder.encode("user01234"))
                .name("홍길동")
                .phone("010-1234-5678")
                .email("user@bookmarket.com")
                .address("경상북도 의성군")
                .role(Role.USER)
                .build());

        log.info("샘플 회원 입력 완료");
    }

    private void initBook() {
        if (bookRepository.count() > 0) return;

        bookRepository.save(Book.builder()
                .bookId("ISBN1234")
                .name("스프링 부트책")
                .unitPrice(new BigDecimal("32000"))
                .author("이동현")
                .description("스프링 부트책")
                .publisher("이크북스")
                .category("IT전문서")
                .unitsInStock(100L)
                .releaseDate("2026-06-16")
                .bookCondition("New")
                .build());

        bookRepository.save(Book.builder()
                .bookId("ISBN1235")
                .name("이것이 자바다")
                .unitPrice(new BigDecimal("36000"))
                .author("한나문")
                .description("자바책")
                .publisher("에크북스")
                .category("IT교육교재")
                .unitsInStock(80L)
                .releaseDate("2026-06-16")
                .bookCondition("New")
                .build());

        bookRepository.save(Book.builder()
                .bookId("ISBN1236")
                .name("자바스크립트")
                .unitPrice(new BigDecimal("45000"))
                .author("김채성")
                .description("자바스크립트책")
                .publisher("길벗출판사")
                .category("IT전문서")
                .unitsInStock(60L)
                .releaseDate("2024-06-16")
                .bookCondition("New")
                .build());

        bookRepository.save(Book.builder()
                .bookId("ISBN1237")
                .name("리액트")
                .unitPrice(new BigDecimal("42000"))
                .author("임지유")
                .description("리액트책")
                .publisher("길벗")
                .category("IT전문서")
                .unitsInStock(50L)
                .releaseDate("2024-06-16")
                .bookCondition("Old")
                .build());

        log.info("도서 데이터 입력 완료");
    }

    // 페이지네이션/검색/정렬 기능 검증용으로 카탈로그를 넓히기 위한 추가 도서 데이터.
    // initBook()과 달리 개별 존재 여부를 확인해서 넣기 때문에 재기동해도 안전하게 누적된다.
    private void initMoreBooks() {
        saveBookIfMissing("ISBN2001", "유럽 도시 기행 3", "18000", "유시민", "유럽의 도시들을 거닐며 쓴 기행 에세이.", "생각의길", "인문", 40L, "2026-06-20", "New");
        saveBookIfMissing("ISBN2002", "만화로 보는 5분 한국사", "16800", "신병주", "만화로 가볍게 훑어보는 한국사 개론.", "빅피시", "인문", 55L, "2025-11-02", "New");
        saveBookIfMissing("ISBN2003", "안녕, 피터팬", "15800", "전경철", "어른이 된 우리를 위한 성장 에세이.", "이야기장수", "자기계발", 30L, "2025-03-14", "New");
        saveBookIfMissing("ISBN2004", "내면 근력", "17800", "짐 머피", "심리적 회복탄력성을 기르는 방법을 다룬 자기계발서.", "윌북", "자기계발", 62L, "2026-06-25", "New");
        saveBookIfMissing("ISBN2005", "니체의 초월자", "16000", "프리드리히 니체", "니체의 철학을 발췌 편역한 잠언집.", "히읏", "인문", 24L, "2024-09-10", "New");
        saveBookIfMissing("ISBN2006", "싯다르타", "12000", "헤르만 헤세", "구도자의 여정을 그린 헤세의 대표작.", "민음사", "소설", 90L, "2002-05-20", "New");
        saveBookIfMissing("ISBN2007", "안녕이라 그랬어", "16500", "김애란", "일상의 균열을 섬세하게 포착한 소설집.", "문학동네", "소설", 45L, "2025-05-08", "New");
        saveBookIfMissing("ISBN2008", "나의 첫 번째 부동산 교과서", "19800", "송희구", "부동산 투자 입문자를 위한 실전 안내서.", "서삼독", "경제경영", 70L, "2024-02-18", "New");
        saveBookIfMissing("ISBN2009", "신 퇴마록 신세편 1", "15000", "이우혁", "퇴마록 시리즈의 새로운 시작.", "반타", "소설", 38L, "2025-08-01", "New");
        saveBookIfMissing("ISBN2010", "신 퇴마록 신세편 2", "15000", "이우혁", "신세편 이야기의 두 번째 권.", "반타", "소설", 33L, "2025-08-01", "New");
        saveBookIfMissing("ISBN2011", "신 퇴마록 신세편 3", "15000", "이우혁", "신세편 이야기를 마무리하는 세 번째 권.", "반타", "소설", 4L, "2025-08-01", "New");
        saveBookIfMissing("ISBN2012", "독서의 기술", "17000", "고명환", "인생을 바꾸는 독서법에 관한 실용서.", "라곰", "자기계발", 58L, "2024-07-05", "New");
        saveBookIfMissing("ISBN2013", "코스모스", "23000", "칼 세이건", "우주와 과학사를 아우르는 교양과학의 고전.", "사이언스북스", "과학", 100L, "1980-12-01", "New");
        saveBookIfMissing("ISBN2014", "굿 인사이드", "19500", "베키 케네디", "아이의 마음을 이해하는 육아 심리서.", "코리아닷컴", "육아", 27L, "2024-11-20", "New");
        saveBookIfMissing("ISBN2015", "부의 갈림길", "18500", "오건영", "글로벌 경제 흐름을 읽는 투자 안내서.", "포레스트북스", "경제경영", 46L, "2025-01-15", "New");
        saveBookIfMissing("ISBN2016", "류수영의 평생 레시피", "22000", "류수영", "누구나 따라할 수 있는 실전 요리 레시피북.", "세미콜론", "요리", 20L, "2024-05-30", "New");
        saveBookIfMissing("ISBN2017", "무염·저염 하나로 끝내는 베이스 유아식", "18800", "애플랜", "이유식부터 유아식까지 활용하는 저염 레시피.", "길벗", "육아", 2L, "2025-09-09", "New");
        saveBookIfMissing("ISBN2018", "프로젝트 헤일메리", "17800", "앤디 위어", "고립된 우주에서 펼쳐지는 SF 서바이벌 소설.", "알에이치코리아", "SF", 65L, "2021-05-04", "New");
        saveBookIfMissing("ISBN2019", "아몬드", "13800", "손원평", "감정을 느끼지 못하는 소년의 성장을 그린 소설.", "창비", "소설", 80L, "2017-03-31", "New");
        saveBookIfMissing("ISBN2020", "나미야 잡화점의 기적", "14800", "히가시노 게이고", "시간을 넘나드는 편지로 이어지는 따뜻한 이야기.", "현대문학", "소설", 72L, "2012-06-08", "New");
        saveBookIfMissing("ISBN2021", "미움받을 용기", "14900", "기시미 이치로", "아들러 심리학을 대화체로 풀어낸 자기계발서.", "인플루엔셜", "자기계발", 95L, "2014-11-17", "New");
        saveBookIfMissing("ISBN2022", "사피엔스", "22000", "유발 하라리", "인류의 역사를 통찰하는 빅히스토리 교양서.", "김영사", "인문", 110L, "2015-11-24", "New");
        saveBookIfMissing("ISBN2023", "팩트풀니스", "16800", "한스 로슬링", "데이터로 세상을 올바르게 보는 법을 다룬 책.", "김영사", "인문", 0L, "2019-03-08", "New");
        saveBookIfMissing("ISBN2024", "부의 추월차선", "16000", "엠제이 드마코", "빠른 부의 축적을 위한 사고방식을 다룬 경제서.", "토트", "경제경영", 54L, "2013-07-15", "New");
        saveBookIfMissing("ISBN2025", "원씽", "15000", "게리 켈러", "성과를 극대화하는 단순함의 원칙을 다룬 자기계발서.", "비즈니스북스", "자기계발", 66L, "2013-05-10", "New");
        saveBookIfMissing("ISBN2026", "자기 앞의 생", "12800", "에밀 아자르", "고아 소년과 노년 여성의 우정을 그린 소설.", "문학동네", "소설", 41L, "2003-05-20", "Old");
        saveBookIfMissing("ISBN2027", "총, 균, 쇠", "25000", "재레드 다이아몬드", "문명의 불평등을 지리와 생태로 설명하는 인문서.", "문학사상", "인문", 58L, "1998-12-01", "Old");
        saveBookIfMissing("ISBN2028", "이기적 유전자", "24000", "리처드 도킨스", "진화생물학의 관점을 뒤바꾼 과학 고전.", "을유문화사", "과학", 49L, "1993-01-01", "Old");
        saveBookIfMissing("ISBN2029", "82년생 김지영", "13800", "조남주", "한 여성의 생애를 통해 사회를 돌아보는 소설.", "민음사", "소설", 88L, "2016-10-14", "New");
        saveBookIfMissing("ISBN2030", "채식주의자", "14000", "한강", "한 여성의 변화를 그린 연작소설.", "창비", "소설", 6L, "2007-10-30", "New");
    }

    private void saveBookIfMissing(String bookId, String name, String price, String author, String description,
                                    String publisher, String category, Long unitsInStock, String releaseDate,
                                    String condition) {
        if (bookRepository.existsById(bookId)) return;

        bookRepository.save(Book.builder()
                .bookId(bookId)
                .name(name)
                .unitPrice(new BigDecimal(price))
                .author(author)
                .description(description)
                .publisher(publisher)
                .category(category)
                .unitsInStock(unitsInStock)
                .releaseDate(releaseDate)
                .bookCondition(condition)
                .build());
    }
}
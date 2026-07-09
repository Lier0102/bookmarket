package com.asdf.bookmarket;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
class BookmarketApplicationTests {

    @Test
    void contextLoads() {
    }

}

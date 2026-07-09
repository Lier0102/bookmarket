package com.asdf.bookmarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
public class BookmarketApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookmarketApplication.class, args);
    }

}

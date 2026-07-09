package com.asdf.bookmarket;

import org.springframework.boot.SpringApplication;

public class TestBookmarketApplication {

    public static void main(String[] args) {
        SpringApplication.from(BookmarketApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}

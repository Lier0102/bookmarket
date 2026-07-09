package com.asdf.bookmarket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing // 여기 쓸거면 main에 없어야 함
public class AuditingConfig {

}

package com.asdf.bookmarket.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiDocumentationConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        SecurityScheme jwtAuth = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP) // http 인증
                .scheme("bearer") // 헤더에 bearer: token방식으로 삽입
                .bearerFormat("JWT") // jwt 토큰
                .name("bearerAuth") // 설정 식별자
                .description("token을 넣으라구요!(격앙된 목소리로)\n\n" + // UI에 보일 설명
                        "로그인 응답의 accessToken 값\n\n" +
                        "Swagger가 자동으로 'Bearer' 접두사 붙임"
                );

        SecurityRequirement securityRequirement = new SecurityRequirement() // requirement로 만듦
                .addList("bearerAuth");

        return new OpenAPI() // 실질적 객체 생성 및 반환은 여기임
                .info(
                        new Info()
                                .title("BookMarket API")
                                .version("1.0")
                                .description("온라인 도서 쇼핑몰 REST API"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", jwtAuth))
                .addSecurityItem(securityRequirement); // 모든 엔드포인트
    }
}

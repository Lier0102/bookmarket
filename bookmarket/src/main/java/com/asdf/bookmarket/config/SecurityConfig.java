package com.asdf.bookmarket.config;

import com.asdf.bookmarket.security.CustomerUserDetailsService;
import com.asdf.bookmarket.security.JwtAuthenticationFilter;
import com.asdf.bookmarket.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity // 스프링 시큐리티 필터 체인 활섣ㅇ화하는 어노테이션
@EnableMethodSecurity(prePostEnabled = true) // 컨트롤러에서 @PreAuthorize 같은 어노테이션 기반 권한 체크 활성호ㅓ
@RequiredArgsConstructor // jwtTokenProvider와 userDetailService의 생성자 주입용
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomerUserDetailsService userDetailService;

    // JWT 커스텀 필터를 빈으로 등록합니다.
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, userDetailService);
    }

    // 프론트엔드 개발 서버(Vite)에서의 크로스오리진 요청을 허용하기 위한 CORS 설정.
    // 5173은 기본 Vite 포트지만 이 머신에서 다른 프로젝트가 점유 중일 수 있어 5174도 함께 허용한다.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf(AbstractHttpConfigurer::disable) // csrf token XXX, jwt 토큰 사용

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // jt니까 걍 stateless
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // URL별 접근 권한(인가) 설정
                .authorizeHttpRequests(auth -> auth
                        // Swagger UI 및 API 문서 관련 경로는 로그인 없이 접근 가능 (Permit All)
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        // 로그인, 회원가입 등 인증 관련 API 무조건 허용
                        .requestMatchers("/api/auth/**").permitAll()
                        // 도서 조회, 게시판 조회의 GET 요청은 비로그인 유저도 허용
                        .requestMatchers(HttpMethod.GET, "/api/book/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/board/**").permitAll()
                        // 나머진 인증 거쳐야함 ㅇㅇ
                        .anyRequest().authenticated()
                )

                // 예외 처리(Error Handling) 커스텀 설정
                .exceptionHandling(ex -> ex
                        // 인증 실패 시 (토큰이 없거나 만료된 경우 - 401 Unauthorized)
                        .authenticationEntryPoint((request, response, authExcept) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=utf-8");
                            String body = new ObjectMapper().writeValueAsString(
                                    Map.of("status", 401, "message", "Unauthorized")
                            );
                            response.getWriter().write(body);
                        })
                        // 권한 부족 시 (로그인은 했으나 일반 유저가 어드민 페이지 관리 등에 접근할 때 - 403 Forbidden)
                        .accessDeniedHandler((request, response, authExcept) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403 상태코드
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=utf-8");
                            String body = new ObjectMapper().writeValueAsString(
                                    Map.of("status", 403, "message", "Admin only")
                            );
                            response.getWriter().write(body);
                        })
                )

                // JWT 커스텀 인증 필터를 UsernamePasswordAuthenticationFilter 전에 끼워 넣기!
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build(); // 최종 시큐리티 필터 체인 빌드 후 반환
    }
}
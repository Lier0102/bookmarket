package com.asdf.bookmarket.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Getter
@Slf4j // 로그용
@Component // spring bean으로 등ㄹ록ㄱ, DI(의존성 주입)어디서나 가능하게
public class JwtTokenProvider{
    private final SecretKey securityKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret, // application.properties에 적어둔 값 읽어옴
            @Value("${app.jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${app.jwt.refresh-token-expiration}") long refreshTokenExpiration) {
        this.securityKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); // 걍 hmac-sha 암호화
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    // 코드 양상은 비슷함, 즉 비즈니스 로직.
    // createAccess에선 짧은 토큰,
    public String createAccessToken(String memberId, String role) {
        return createToken(memberId, role, "access", accessTokenExpiration);
    }

    // refresh는 좀 더 길게, 그러니까 사회적인 통념 같은 거 ㅇㅇs
    public String createRefreshToken(String memberId, String role) {
        return createToken(memberId, role, "refresh", refreshTokenExpiration);
    }

    // 밀리초, 현재 시간에 expire date 추가
    public String createToken(String memberId, String role, String type, long expiration) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(memberId)
                .claim("role", role)
                .claim("type", type)
                .issuedAt(now)
                .expiration(expirationDate)
                .signWith(securityKey)
                .compact();
    }

    public String getMemberId(String token) {
        return getClaims(token).getSubject();
    }

    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public String getTokenType(String token) {
        return getClaims(token).get("type", String.class);
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT Token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT Token: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT Token: {}", e.getMessage());
        } catch (SecurityException e) {
            log.warn("No token was provided: {}", e.getMessage());
        }
        return false;
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(securityKey)
                .build()// 엮ㅏ지 파서 설정
                .parseSignedClaims(token)
                .getPayload(); // 파서 파고 페아ㅣ로드 가져옴
    }
}

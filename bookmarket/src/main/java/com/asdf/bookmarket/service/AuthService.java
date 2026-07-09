package com.asdf.bookmarket.service;

import com.asdf.bookmarket.dto.request.LoginRequest;
import com.asdf.bookmarket.dto.request.SignupRequest;
import com.asdf.bookmarket.dto.response.MemberResponse;
import com.asdf.bookmarket.dto.response.TokenResponse;
import com.asdf.bookmarket.entity.Member;
import com.asdf.bookmarket.entity.Role;
import com.asdf.bookmarket.exception.BusinessException;
import com.asdf.bookmarket.exception.ErrorCode;
import com.asdf.bookmarket.repository.MemberRepository;
import com.asdf.bookmarket.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class    AuthService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public MemberResponse signup(SignupRequest request) {
        if (memberRepository.existsByUsername(request.getMemberId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_MEMBER_ID);
        }

        Member member = Member.builder()
                .username(request.getMemberId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .role(Role.USER)
                .build();

        Member savedMember = memberRepository.save(member);
        log.info("Member saved successfully: {}", savedMember.getUsername());

        return MemberResponse.from(savedMember);
    }

    public TokenResponse login(LoginRequest request) {
        Member member = memberRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(ErrorCode.LOGIN_FAILED));

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new BusinessException(ErrorCode.LOGIN_FAILED);
        }

        String role = member.getRole().name();
        String accessToken = jwtTokenProvider.createAccessToken(member.getUsername(), role);
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getUsername(), role);

        log.info("Login Succeed, Access token: {}", accessToken);
        return TokenResponse.of(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpiration(),
                member.getUsername(),
                role
        );
    }

    public TokenResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        // 액세스 토큰으로 갱신하는 것 방지 (refresh 타입만 허용)
        if (!"refresh".equals(jwtTokenProvider.getTokenType(refreshToken))) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        String memberId = jwtTokenProvider.getMemberId(refreshToken);
        String role = jwtTokenProvider.getRole(refreshToken);
        String newAccessToken = jwtTokenProvider.createAccessToken(memberId, role);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(memberId, role);

        log.info("Refresh Succeed, Access token: {}", newAccessToken);

        return TokenResponse.of(
                newAccessToken,
                newRefreshToken,
                jwtTokenProvider.getAccessTokenExpiration(),
                memberId,
                role
        );
    }
}

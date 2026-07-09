package com.asdf.bookmarket.security;

import com.asdf.bookmarket.entity.Member;
import com.asdf.bookmarket.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerUserDetailsService implements UserDetailsService {
    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String memberId) throws UsernameNotFoundException {
        Member member = memberRepository.findByUsername(memberId)
                .orElseThrow(() -> new UsernameNotFoundException("Member not found" + memberId));
        return new CustomerUserDetails(member);
    }
}

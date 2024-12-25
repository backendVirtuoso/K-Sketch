package com.trip.app.jwt;

import com.trip.app.model.MemberDTO;
import com.trip.app.service.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil){
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        // Authorization 헤더에서 토큰을 추출
        String authorization = request.getHeader("Authorization");

        if (authorization == null || !authorization.startsWith("Bearer")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorization.split(" ")[1];

        if (jwtUtil.isExpired(token)) {
            System.out.println("Token expired");
            filterChain.doFilter(request, response);
            return;
        }

        // 토큰에서 사용자 정보와 역할 추출
        String username = jwtUtil.getUsername(token);
        String role = jwtUtil.getRole(token);

        // MemberDTO 설정
        MemberDTO memberDTO = new MemberDTO();
        memberDTO.setLoginId(username);
        memberDTO.setPassword("temppassword");
        memberDTO.setRole(role);

        // CustomUserDetails 생성
        CustomUserDetails customUserDetails = new CustomUserDetails(memberDTO);

        // 권한 확인 로그 추가
        System.out.println("CustomUserDetails Authorities: " + customUserDetails.getAuthorities());

        // Authentication 객체 생성
        Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

        // 인증 정보 설정
        SecurityContextHolder.getContext().setAuthentication(authToken);

        // 인증 정보 로그 추가
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            System.out.println("Authentication: " + authentication);
            System.out.println("Roles: " + authentication.getAuthorities());
        } else {
            System.out.println("Authentication is null");
        }

        // 필터 체인 진행
        filterChain.doFilter(request, response);
    }
}

package com.trip.app.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trip.app.model.MemberDTO;
import com.trip.app.service.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public LoginFilter(AuthenticationManager authenticationManager, JwtUtil jwtUtil){
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        System.out.println("***********1");
        ObjectMapper objectMapper = new ObjectMapper();
        MemberDTO memberDTO;

        try {
            // JSON 요청 본문 읽기
            memberDTO = objectMapper.readValue(request.getInputStream(), MemberDTO.class);
        } catch(IOException e){
            throw new RuntimeException("Failed to parse request body", e);
        }

        String username = memberDTO.getLoginId();
        String password = memberDTO.getPassword();

        System.out.println("Username: " + username);
        System.out.println("Password: " + password);

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username, password, null);

        return authenticationManager.authenticate(authToken);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authentication)
            throws IOException, ServletException {
        System.out.println("***********2");
        // UserDetails 가져오기
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();

        // 사용자명(아이디) 가져오기
        String username = customUserDetails.getUsername();

        // 권한 가져오기
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        String role = auth.getAuthority();

        // JWT 토큰 생성 (10시간)
        String token = jwtUtil.createJwt(username, role, 60 * 60 * 10 * 1000L);

        // 응답 헤더에 JWT 토큰 추가
        response.addHeader("Authorization", "Bearer " + token);

        // JWT 토큰을 응답 본문에 추가
        response.setContentType("application/json");
        response.getWriter().write("{\"token\":\"" + token + "\"}");

        // JWT 토큰과 로그인 성공 메세지 출력하기
        System.out.println("JWT 토큰 발급 성공 : " + token);
        System.out.println("로그인 성공 : 사용자 아이디 = " + username + ", 구분 = " + role);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed){
        // 로그인 실패시 401 응답 코드 반환
        response.setStatus(401);
        System.out.println("로그인 실패");
    }

}

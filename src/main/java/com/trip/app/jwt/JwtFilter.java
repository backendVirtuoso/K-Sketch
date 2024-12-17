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

        // request 에서 Authorization 헤더를 찾음
        String authorization = request.getHeader("Authorization");

        // Authorization 헤더 검증
        if(authorization == null || !authorization.startsWith("Bearer")){
            filterChain.doFilter(request, response);

            return;
        }

        String token = authorization.split(" ")[1];

        if(jwtUtil.isExpired(token)){
            System.out.println("token expired");
            filterChain.doFilter(request, response);

            return;
        }

        String username = jwtUtil.getUsername(token);
        String role = jwtUtil.getRole(token);

        MemberDTO memberDTO = new MemberDTO();
        memberDTO.setLoginId(username);
        memberDTO.setPassword("temppassword"); // 비밀번호는 토큰에 저장되지않는데 디비에서 조회하게되면 매번 디비를 조회해야하기때문에 임시비번으로 초기화한다.
        memberDTO.setRole(role);

        CustomUserDetails customUserDetails = new CustomUserDetails(memberDTO);

        Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);

        System.out.println("authToken : " + authToken);

        filterChain.doFilter(request, response);
    }
}

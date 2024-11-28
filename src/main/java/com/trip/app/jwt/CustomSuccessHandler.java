package com.trip.app.jwt;

import com.trip.app.model.CustomOAuth2User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Collection;

@Component
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;

    public CustomSuccessHandler(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        CustomOAuth2User customUserDetails = (CustomOAuth2User) authentication.getPrincipal();
        String username = customUserDetails.getUsername();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String role = authorities.iterator().next().getAuthority();

        // JWT 생성
        long expirationTime = 30 * 60 * 1000L;
        String token = jwtUtil.createJwt(username, role, expirationTime);

        // Sysout for debugging purposes
        System.out.println("이름: " + username);
        System.out.println("Token: " + token);
        System.out.println("만료 시간 " + expirationTime);

        try {
            // URL 인코딩
            String encodedUsername = URLEncoder.encode(username, "UTF-8");

            // React 클라이언트로 리디렉션 (JWT와 사용자 이름 포함)
            String redirectUrl = "http://localhost:3000/oauth2/success?token=" + token + "&username=" + encodedUsername;
            response.sendRedirect(redirectUrl);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            // URL 인코딩 실패 시 에러 처리
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Encoding error occurred.");
        }

    }
}

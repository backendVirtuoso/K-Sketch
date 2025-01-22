package com.trip.app.config;

import com.trip.app.jwt.CustomSuccessHandler;
import com.trip.app.jwt.JwtFilter;
import com.trip.app.jwt.JwtUtil;
import com.trip.app.jwt.LoginFilter;
import com.trip.app.service.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final JwtUtil jwtUtil;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomSuccessHandler customSuccessHandler;

    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration, JwtUtil jwtUtil, CustomOAuth2UserService customOAuth2UserService, CustomSuccessHandler customSuccessHandler) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.jwtUtil = jwtUtil;
        this.customOAuth2UserService = customOAuth2UserService;
        this.customSuccessHandler = customSuccessHandler;
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // React 클라이언트 주소
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // 허용할 HTTP 메서드
        configuration.setAllowCredentials(true); // 쿠키 및 인증 정보 허용
        configuration.setAllowedHeaders(Arrays.asList("*")); // 모든 헤더 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource())); // CORS 설정 추가
        http.csrf(csrf -> csrf.disable()); // CSRF 비활성화
        http.formLogin(formLogin -> formLogin.disable()); // Form 로그인 비활성화
        http.httpBasic(httpBasic -> httpBasic.disable()); // HTTP Basic 비활성화

        // OAuth2 설정
        http.oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfoEndpointConfig -> userInfoEndpointConfig
                        .userService(customOAuth2UserService))
                .successHandler(customSuccessHandler)
        );

        // 요청 권한 설정
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/main/**").permitAll()
                .requestMatchers("/api/kafkachat/room").permitAll()
                .requestMatchers("/api/kafkachat/rooms").permitAll()
                .requestMatchers("/api/kafkachat/room/{roomId}", "/api/kafkachat/room").authenticated()
                .requestMatchers("/", "/ws/**", "/api/join", "/api/like/userLike", "/api/like/userLikeList", "/api/like/likePlaceList", "/api/like/check", "/api/like/count").permitAll()
                .requestMatchers("/api/trips/", "/api/trips/save", "/api/trips/mytrip").authenticated()
                .requestMatchers("/api/check-duplicate-id", "/api/check-duplicate-email", "/api/search-id-email", "/api/search-pw-email", "/api/pw-change", "/api/userinfo-Modify","/api/userinfo").permitAll()
                .requestMatchers("/api/festival", "/api/stay", "/api/common", "/api/search", "/api/areaCode", "/api/areaList").permitAll()
        );

        // 권한 부족 시 처리 (AccessDeniedHandler 설정)
        http.exceptionHandling(exception -> exception
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\": \"Forbidden: Access denied\"}");
                })
        );

        // JWT 필터 추가
        LoginFilter loginFilter = new LoginFilter(authenticationManager(authenticationConfiguration), jwtUtil);
        loginFilter.setFilterProcessesUrl("/api/login");

        http.addFilterBefore(new JwtFilter(jwtUtil), LoginFilter.class);
        http.addFilterAt(loginFilter, UsernamePasswordAuthenticationFilter.class);

        // 세션 정책 설정
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // 로그아웃 설정
        http.logout(log -> log
                .logoutUrl("/api/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    // 로그아웃 성공 시 처리
                    System.out.println("로그아웃 처리가 완료됨");
                    response.setStatus(HttpServletResponse.SC_OK);
                })
                .addLogoutHandler((request, response, authentication) -> {
                    // SecurityContext 초기화
                    SecurityContextHolder.clearContext();
                })
        );

        return http.build();
    }
}

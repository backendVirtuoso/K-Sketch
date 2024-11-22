package com.trip.app.config;

import com.trip.app.jwt.JwtFilter;
import com.trip.app.jwt.JwtUtil;
import com.trip.app.jwt.LoginFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final JwtUtil jwtUtil;

    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration, JwtUtil jwtUtil) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.jwtUtil = jwtUtil;
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
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(Arrays.asList("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(withDefaults -> {});
        http.csrf((auth) -> auth.disable());
        http.formLogin((auth) -> auth.disable());
        http.httpBasic((auth) -> auth.disable());
        http.authorizeHttpRequests((auth) -> auth
                // 특정 요청 패턴에 대해 인증 요구
                .requestMatchers("/api/kafkachat/room").permitAll() // 방 목록은 인증 없이 조회 가능
                .requestMatchers("/api/kafkachat/rooms").permitAll() // 방 정보도 인증 없이 가능
                .requestMatchers("/api/kafkachat/room/{roomId}", "/api/kafkachat/room").authenticated() // 방 생성 및 입장은 인증 필요
                .requestMatchers("/admin").hasRole("ADMIN")
                .requestMatchers("/api/festival", "/api/stay", "/api/common", "/api/search").authenticated()
                .requestMatchers("/", "/ws/**", "/api/join").permitAll()
                .requestMatchers("/api/check-duplicate-id", "/api/check-duplicate-email", "/api/search-id-email","/api/search-pw-email","/api/pw-change").permitAll()
        );

        LoginFilter loginFilter = new LoginFilter(authenticationManager(authenticationConfiguration), jwtUtil);
        loginFilter.setFilterProcessesUrl("/api/login");

        http.addFilterBefore(new JwtFilter(jwtUtil), LoginFilter.class);
        http.addFilterAt(loginFilter, UsernamePasswordAuthenticationFilter.class);
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.logout((log) -> log
                .logoutUrl("/api/logout")
                .logoutSuccessHandler(((request, response, authentication) -> {
                    // 로그아웃 성공시 처리
                    System.out.println("로그아웃 처리가 완료됨");
                    response.setStatus(HttpServletResponse.SC_OK);
                }))
                .addLogoutHandler(new LogoutHandler() {
                    @Override
                    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
                        // 추가적인 로그아웃 처리 여기서 (Ex -> 토큰 무효 화, 토큰 블랙리스트 등등)
                    }
                }));

        return http.build();
    }


}
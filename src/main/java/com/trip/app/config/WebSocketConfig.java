package com.trip.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // stomp 접속 주소 url = ws://localhost:8080/ws, 프로토콜이 http가 아니다!
        registry.addEndpoint("/ws") // 연결될 엔드포인트
                .setAllowedOrigins("https://web-frontend-m8uaask821ad767f.sel4.cloudtype.app").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/sub");    // 메시지를 구독(수신)하는 요청 엔드포인트
        registry.setApplicationDestinationPrefixes("/pub");     // 메시지를 발행(송신)하는 엔드포인트
    }
}

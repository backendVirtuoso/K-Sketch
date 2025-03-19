package com.trip.app.model;

import com.trip.app.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class KafkaConsumer {
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatService chatService;

    public KafkaConsumer(SimpMessageSendingOperations messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    /**
     * Kafka에서 메시지가 발행(publish)되면 대기하고 있던 Kafka Consumer가 해당 메시지를 받아 처리한다.
     */
    @KafkaListener(topics = "${spring.kafka.template.default-topic}", groupId = "${spring.kafka.consumer.group-id}")
    public void sendMessage(KafkaChatMessage chatMessage) {
        try {
            // 메시지를 MySQL과 Redis에 저장
            chatService.saveMessage(chatMessage);
            
            // WebSocket 구독자에게 메시지 전송
            messagingTemplate.convertAndSend("/sub/kafkachat/room/" + chatMessage.getRoomId(), chatMessage);
        } catch (Exception e) {
            log.error("Error processing chat message: ", e);
        }
    }
}

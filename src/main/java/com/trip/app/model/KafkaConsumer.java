package com.trip.app.model;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class KafkaConsumer {
    private final SimpMessageSendingOperations messagingTemplate;

    public KafkaConsumer(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Kafka에서 메시지가 발행(publish)되면 대기하고 있던 Kafka Consumer가 해당 메시지를 받아 처리한다.
     */
    @KafkaListener(topics = "${spring.kafka.template.default-topic}", groupId = "${spring.kafka.consumer.group-id}")
    public void sendMessage(KafkaChatMessage chatMessage) {
        try {
            messagingTemplate.convertAndSend("/sub/kafkachat/room/" + chatMessage.getRoomId(), chatMessage); // Websocket 구독자에게 채팅 메시지 Send
        } catch (Exception e) {
        }
    }
}

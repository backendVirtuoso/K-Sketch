package com.trip.app.controller;

import com.trip.app.model.KafkaChatMessage;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class KafkaChatMessageController {
    private final KafkaTemplate<String, KafkaChatMessage> kafkaTemplate;
    private final NewTopic topic;

    public KafkaChatMessageController(KafkaTemplate<String, KafkaChatMessage> kafkaTemplate, NewTopic topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
    }

    @MessageMapping("/kafkachat/message")
    public void message(KafkaChatMessage kafkaChatMessage) {
        if (KafkaChatMessage.MessageType.ENTER.equals(kafkaChatMessage.getType())) {
            kafkaChatMessage.setMessage(kafkaChatMessage.getSender() + "님 등장!");
        }

        kafkaTemplate.send(topic.name(), kafkaChatMessage);
    }
}
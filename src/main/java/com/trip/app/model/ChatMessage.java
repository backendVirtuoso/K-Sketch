package com.trip.app.model;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
public class ChatMessage {
    private Long id;
    private String roomId;
    private String sender;
    private String message;
    private LocalDateTime timestamp;
    private KafkaChatMessage.MessageType type;
}
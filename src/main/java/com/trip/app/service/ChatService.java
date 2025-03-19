package com.trip.app.service;

import com.trip.app.model.ChatMessage;
import com.trip.app.model.KafkaChatMessage;
import com.trip.app.mapper.ChatMessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageMapper chatMessageMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CHAT_MESSAGES_KEY = "CHAT_MESSAGES:";

    @Transactional
    public void saveMessage(KafkaChatMessage kafkaChatMessage) {
        // MySQL에 저장
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setRoomId(kafkaChatMessage.getRoomId());
        chatMessage.setSender(kafkaChatMessage.getSender());
        chatMessage.setMessage(kafkaChatMessage.getMessage());
        chatMessage.setType(kafkaChatMessage.getType());
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessageMapper.insertMessage(chatMessage);

        // Redis에 최근 메시지 캐싱 (선택적)
        String redisKey = CHAT_MESSAGES_KEY + kafkaChatMessage.getRoomId();
        redisTemplate.opsForList().leftPush(redisKey, kafkaChatMessage);
        redisTemplate.opsForList().trim(redisKey, 0, 99); // 최근 100개 메시지만 유지
    }

    public List<ChatMessage> getRecentMessages(String roomId) {
        return chatMessageMapper.findTop100ByRoomIdOrderByTimestampDesc(roomId);
    }

    public List<ChatMessage> getAllMessages(String roomId) {
        return chatMessageMapper.findByRoomIdOrderByTimestampDesc(roomId);
    }
}
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
        String redisKey = CHAT_MESSAGES_KEY + roomId;

        try {
            // 1. Redis 캐시 확인
            List<Object> cachedMessages = redisTemplate.opsForList().range(redisKey, 0, 99);

            if (cachedMessages != null && !cachedMessages.isEmpty()) {
                // 캐시 히트: Redis에서 반환
                System.out.println("Cache HIT for room: " + roomId);
                return chatMessageMapper.findTop100ByRoomIdOrderByTimestampDesc(roomId);
            }
        } catch (Exception e) {
            System.out.println("Redis cache read error, falling back to DB: " + e.getMessage());
        }

        // 2. 캐시 미스: DB 조회
        System.out.println("Cache MISS for room: " + roomId + ", querying DB");
        List<ChatMessage> messages = chatMessageMapper.findTop100ByRoomIdOrderByTimestampDesc(roomId);

        // 3. Redis에 캐싱 (비동기적으로 처리하는 것이 좋지만 간단하게 동기 처리)
        if (!messages.isEmpty()) {
            try {
                // 기존 캐시 삭제 후 새로 저장
                redisTemplate.delete(redisKey);
                for (ChatMessage msg : messages) {
                    redisTemplate.opsForList().rightPush(redisKey, msg);
                }
                redisTemplate.opsForList().trim(redisKey, 0, 99);
                System.out.println("Cached " + messages.size() + " messages for room: " + roomId);
            } catch (Exception e) {
                System.out.println("Failed to cache messages: " + e.getMessage());
            }
        }

        return messages;
    }

    public List<ChatMessage> getAllMessages(String roomId) {
        return chatMessageMapper.findByRoomIdOrderByTimestampDesc(roomId);
    }
}
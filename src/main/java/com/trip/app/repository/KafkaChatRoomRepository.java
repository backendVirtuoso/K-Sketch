package com.trip.app.repository;

import com.trip.app.model.KafkaChatRoom;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@RequiredArgsConstructor
@Repository
public class KafkaChatRoomRepository {
    private static final String CHAT_ROOMS = "CHAT_ROOM";
    private final RedisTemplate<String, Object> redisTemplate;  // redis
    private HashOperations<String, String, KafkaChatRoom> opsHashChatRoom;   // redis 저장

    @PostConstruct
    private void init() {
        opsHashChatRoom = redisTemplate.opsForHash();
    }

    // 채팅방 단일 조회
    public KafkaChatRoom findRoomById(String id) {
        return opsHashChatRoom.get(CHAT_ROOMS, id);
    }

    // 채팅방 목록 조회
    public List<KafkaChatRoom> findAllRoom() {
        return opsHashChatRoom.values(CHAT_ROOMS);
    }

    /**
     * 채팅방 생성 : 서버간 채팅방 공유를 위해 redis hash에 저장한다.
     */
    public KafkaChatRoom createChatRoom(String name) {
        KafkaChatRoom kafkaChatRoom = KafkaChatRoom.create(name);
        opsHashChatRoom.put(CHAT_ROOMS, kafkaChatRoom.getRoomId(), kafkaChatRoom);    // 채팅방 redis에 저장
        return kafkaChatRoom;
    }
}

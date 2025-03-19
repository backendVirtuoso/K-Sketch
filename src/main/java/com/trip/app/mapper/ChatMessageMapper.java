package com.trip.app.mapper;

import com.trip.app.model.ChatMessage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ChatMessageMapper {
    void insertMessage(ChatMessage message);
    List<ChatMessage> findByRoomIdOrderByTimestampDesc(@Param("roomId") String roomId);
    List<ChatMessage> findTop100ByRoomIdOrderByTimestampDesc(@Param("roomId") String roomId);
} 
package com.trip.app.controller;

import com.trip.app.model.ChatMessage;
import com.trip.app.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;

    @GetMapping("/messages/{roomId}")
    public ResponseEntity<List<ChatMessage>> getRecentMessages(@PathVariable(name = "roomId") String roomId) {
        List<ChatMessage> messages = chatService.getRecentMessages(roomId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/messages/{roomId}/all")
    public ResponseEntity<List<ChatMessage>> getAllMessages(@PathVariable(name = "roomId") String roomId) {
        List<ChatMessage> messages = chatService.getAllMessages(roomId);
        return ResponseEntity.ok(messages);
    }
}
package com.trip.app.controller;

import com.trip.app.model.KafkaChatRoom;
import com.trip.app.repository.KafkaChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/kafkachat")
public class KafkaChatRoomController {
    private final KafkaChatRoomRepository kafkaChatRoomRepository;

    @GetMapping("/room")
    public List<KafkaChatRoom> rooms() {  // Model 파라미터 제거하고 반환 타입 변경
        return kafkaChatRoomRepository.findAllRoom();
    }

    @GetMapping("/rooms")
    @ResponseBody
    public List<KafkaChatRoom> room() {
        return kafkaChatRoomRepository.findAllRoom();
    }

    @PostMapping("/room")
    @ResponseBody
    public KafkaChatRoom createRoom(@RequestParam("name") String name) {
        return kafkaChatRoomRepository.createChatRoom(name);
    }

    @GetMapping("/room/enter/{roomId}")
    public String roomDetail(Model model, @PathVariable("roomId") String roomId) {
        model.addAttribute("roomId", roomId);
        return "/kafkachat/roomdetail";
    }

    @GetMapping("/room/{roomId}")
    @ResponseBody
    public KafkaChatRoom roomInfo(@PathVariable("roomId") String roomId) {
        return kafkaChatRoomRepository.findRoomById(roomId);
    }
}

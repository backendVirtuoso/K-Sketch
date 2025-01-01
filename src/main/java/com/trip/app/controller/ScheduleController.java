package com.trip.app.controller;

import com.trip.app.jwt.JwtUtil;
import com.trip.app.model.ScheduleDTO;
import com.trip.app.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/trips")
public class ScheduleController {
    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/save")
    public ResponseEntity<?> saveTrip(@RequestBody ScheduleDTO scheduleDTO, @RequestHeader("Authorization") String token) {
        String loginId = jwtUtil.getUsername(token.replace("Bearer ", ""));

        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false,
                            "message", "로그인이 필요합니다."));
        }

        scheduleDTO.setLoginId(loginId);
        ScheduleDTO savedSchedule = scheduleService.saveSchedule(scheduleDTO);

        return ResponseEntity.ok().body(Map.of(
            "success", true,
            "tripId", savedSchedule.getTripId()
        ));
    }
}

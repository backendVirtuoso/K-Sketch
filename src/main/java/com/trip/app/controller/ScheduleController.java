package com.trip.app.controller;

import com.trip.app.jwt.JwtUtil;
import com.trip.app.model.ScheduleDTO;
import com.trip.app.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
                    .body(Map.of("success", false, "message", "로그인이 필요합니다."));
        }

        scheduleDTO.setLoginId(loginId);
        ScheduleDTO savedSchedule = scheduleService.saveSchedule(scheduleDTO);

        return ResponseEntity.ok().body(Map.of(
            "success", true,
            "tripId", savedSchedule.getTripId()
        ));
    }

    @GetMapping("/mytrip")
    public ResponseEntity<?> getUserTrips(@RequestHeader("Authorization") String token, @RequestParam("loginId") String loginId) {
        String tokenLoginId = jwtUtil.getUsername(token.replace("Bearer ", ""));
        
        if (!tokenLoginId.equals(loginId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "권한이 없습니다."));
        }

        List<ScheduleDTO> trips = scheduleService.getUserTrips(loginId);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/schedule/{tripId}")
    public ResponseEntity<?> getTripSchedule(@PathVariable("tripId") Long tripId) {
        try {
            ScheduleDTO schedule = scheduleService.getTripSchedule(tripId);
            if (schedule == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                            "success", false,
                            "message", "해당 일정을 찾을 수 없습니다."
                        ));
            }
            return ResponseEntity.ok(schedule);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "success", false,
                        "message", "일정을 불러오는데 실패했습니다."
                    ));
        }
    }
}

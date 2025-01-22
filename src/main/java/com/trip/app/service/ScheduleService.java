package com.trip.app.service;

import com.trip.app.mapper.ScheduleMapper;
import com.trip.app.model.ScheduleDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleService {
    @Autowired
    private ScheduleMapper scheduleMapper;

    // 여행 정보 저장
    public ScheduleDTO saveSchedule(ScheduleDTO scheduleDTO) {
        if (scheduleDTO.getTripId() == null) {
            scheduleMapper.insertSchedule(scheduleDTO);
        } else {
            scheduleMapper.updateSchedule(scheduleDTO);
        }
        return scheduleDTO;
    }

    // 여행 정보 조회
    public List<ScheduleDTO> getUserTrips(String loginId) {
        return scheduleMapper.getUserTrips(loginId);
    }
}
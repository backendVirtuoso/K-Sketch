package com.trip.app.service;

import com.trip.app.mapper.ScheduleMapper;
import com.trip.app.model.ScheduleDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ScheduleService {
    @Autowired
    private ScheduleMapper scheduleMapper;

    public ScheduleDTO saveSchedule(ScheduleDTO scheduleDTO) {
        if (scheduleDTO.getTripId() == null) {
            // 새로운 일정 저장
            scheduleMapper.insertSchedule(scheduleDTO);
        } else {
            // 기존 일정 수정
            scheduleMapper.updateSchedule(scheduleDTO);
        }
        return scheduleDTO;
    }
}
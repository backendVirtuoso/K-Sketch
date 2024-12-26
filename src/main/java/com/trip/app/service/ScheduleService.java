package com.trip.app.service;

import com.trip.app.mapper.ScheduleMapper;
import com.trip.app.model.ScheduleDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ScheduleService {
    @Autowired
    private ScheduleMapper scheduleMapper;

    public boolean saveSchedule(ScheduleDTO scheduleDTO) {
        return scheduleMapper.insertSchedule(scheduleDTO) > 0;
    }
}
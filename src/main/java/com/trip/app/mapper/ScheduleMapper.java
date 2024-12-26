package com.trip.app.mapper;

import com.trip.app.model.ScheduleDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ScheduleMapper {
    int insertSchedule(ScheduleDTO scheduleDTO);
}

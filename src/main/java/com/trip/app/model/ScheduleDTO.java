package com.trip.app.model;

import lombok.Data;

@Data
public class ScheduleDTO {
    private String title;
    private String startDate;
    private String endDate;
    private String tripPlan;
    private String loginId;
}

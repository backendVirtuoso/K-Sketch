package com.trip.app.model;

import lombok.Data;

@Data
public class ScheduleDTO {
    private Long tripId;
    private String title;
    private String startDate;
    private String endDate;
    private String createdDate;
    private String modifiedDate;
    private String tripPlan;
    private String loginId;
}

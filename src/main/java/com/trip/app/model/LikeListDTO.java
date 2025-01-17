package com.trip.app.model;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class LikeListDTO {
    private int id;
    private int user_id;
    private String place_id;
    private Timestamp created_at;
}

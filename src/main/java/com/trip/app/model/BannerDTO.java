package com.trip.app.model;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class BannerDTO {
    private Long id;
    private byte[] image;
    private String imageName;
}

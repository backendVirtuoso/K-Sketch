package com.trip.app.model;

import lombok.Data;

@Data
public class TourApiPlaceDTO {
    private Long id;
    private String contentId;
    private String title;
    private String addr1;
    private String addr2;
    private String firstImage;
    private String firstImage2;
    private Double mapx;
    private Double mapy;
    private String contentTypeId;
    private String cat1;
    private String cat2;
    private String cat3;
} 
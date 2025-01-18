package com.trip.app.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TourApiPlaceDTO {
    private Long id;
    private String contentId;
    private String title;
    private String tel;
    private String addr1;
    private String addr2;
    @JsonProperty("first_image")
    private String first_image;
    private String firstImage2;
    private Double mapx;
    private Double mapy;
    private String contentTypeId;
    private String cat1;
    private String cat2;
    private String cat3;
    private Integer orderNo;
    private String mlevel;
    private String areacode;
    private String booktour;
    private String cpyrhtDivCd;
    private String createdtime;
    private String modifiedtime;
    private String sigungucode;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
} 
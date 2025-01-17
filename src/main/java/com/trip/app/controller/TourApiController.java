package com.trip.app.controller;

import com.trip.app.service.TourApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class TourApiController {

    private final TourApiService tourApiService;

    @GetMapping("/{apiType}")
    public ResponseEntity<?> getApiData(
            @PathVariable("apiType") String apiType,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "contentId", required = false) String contentId,
            @RequestParam(value = "contentTypeId", required = false) String contentTypeId,
            @RequestParam(value = "categoryCode", required = false) String categoryCode) {

        try {
            return switch (apiType) {
                case "stay" -> {
                    String stayList = tourApiService.getApiPlacesData("stay", null, keyword, contentTypeId, null);
                    yield ResponseEntity.ok(stayList);
                }
                case "common" -> {
                    String commonInfo = tourApiService.getApiPlacesData("common", String.valueOf(contentId), keyword, contentTypeId, null);
                    yield ResponseEntity.ok(commonInfo);
                }
                case "festival" -> {
                    String festivalData = tourApiService.getApiPlacesData("festival", null, keyword, contentTypeId, null);
                    yield ResponseEntity.ok(festivalData);
                }
                case "search" -> {
                    String searchData = tourApiService.getApiPlacesData("search", null, keyword, contentTypeId, null);
                    yield ResponseEntity.ok(searchData);
                }
                case "areaCode" -> {
                    String areaCode = tourApiService.getApiPlacesData("areaCode", null, keyword, contentTypeId, null);
                    yield ResponseEntity.ok(areaCode);
                }
                case "areaList" -> {
                    String areaList = tourApiService.getApiPlacesData("areaList", null, keyword, contentTypeId, categoryCode);
                    yield ResponseEntity.ok(areaList);
                }
                default -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid API type");
            };
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch data");
        }
    }
}
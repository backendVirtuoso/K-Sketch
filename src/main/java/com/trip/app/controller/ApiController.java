package com.trip.app.controller;

import com.trip.app.service.ApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class ApiController {

    private final ApiService apiService;

    @GetMapping("/{apiType}")
    public ResponseEntity<?> getApiData(
            @PathVariable("apiType") String apiType,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "contentId", required = false) String contentId,
            @RequestParam(value = "contentTypeId", required = false) String contentTypeId) {

        try {
            return switch (apiType) {
                case "stay" -> {
                    String stayList = apiService.getApiPlacesData("stay", null, keyword, contentTypeId);
                    yield ResponseEntity.ok(stayList);
                }
                case "common" -> {
                    String commonInfo = apiService.getApiPlacesData("common", String.valueOf(contentId), keyword, contentTypeId);
                    yield ResponseEntity.ok(commonInfo);
                }
                case "festival" -> {
                    String festivalData = apiService.getApiPlacesData("festival", null, keyword, contentTypeId);
                    yield ResponseEntity.ok(festivalData);
                }
                case "search" -> {
                    String searchData = apiService.getApiPlacesData("search", null, keyword, contentTypeId);
                    yield ResponseEntity.ok(searchData);
                }
                default -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid API type");
            };
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch data");
        }
    }
}

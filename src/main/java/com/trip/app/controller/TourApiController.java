package com.trip.app.controller;

import com.trip.app.model.TourApiPlaceDTO;
import com.trip.app.service.TourApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
                    String stayList = tourApiService.getApiPlacesData("stay", null, keyword, contentTypeId, null, 1);
                    yield ResponseEntity.ok(stayList);
                }
                case "common" -> {
                    String commonInfo = tourApiService.getApiPlacesData("common", String.valueOf(contentId), keyword, contentTypeId, null, 1);
                    yield ResponseEntity.ok(commonInfo);
                }
                case "festival" -> {
                    String festivalData = tourApiService.getApiPlacesData("festival", null, keyword, contentTypeId, null, 1);
                    yield ResponseEntity.ok(festivalData);
                }
                case "search" -> {
                    String searchData = tourApiService.getApiPlacesData("search", null, keyword, contentTypeId, null, 1);
                    yield ResponseEntity.ok(searchData);
                }
                case "areaCode" -> {
                    String areaCode = tourApiService.getApiPlacesData("areaCode", null, keyword, contentTypeId, null, 1);
                    yield ResponseEntity.ok(areaCode);
                }
                case "areaList" -> {
                    String areaList = tourApiService.getApiPlacesData("areaList", null, keyword, contentTypeId, categoryCode, 1);
                    yield ResponseEntity.ok(areaList);
                }
                default -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid API type");
            };
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch data");
        }
    }

    @GetMapping("/db/{apiType}")
    public ResponseEntity<?> getDbData(
            @PathVariable("apiType") String apiType,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "contentTypeId", required = false) String contentTypeId,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        
        try {
            Map<String, Object> response = new HashMap<>();
            List<TourApiPlaceDTO> places = tourApiService.searchPlacesFromDb(keyword, contentTypeId, page, size);
            int totalCount = tourApiService.countPlacesFromDb(keyword, contentTypeId);
            
            response.put("items", places);
            response.put("totalCount", totalCount);
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch data from database");
        }
    }
    
    @PostMapping("/sync")
    public ResponseEntity<String> syncTourApiData() {
        try {
            tourApiService.syncTourApiData();
            return ResponseEntity.ok("Tour API 데이터 동기화가 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Tour API 데이터 동기화 중 오류가 발생했습니다.");
        }
    }
}

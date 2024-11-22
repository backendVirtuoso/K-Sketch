package com.trip.app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class ApiService {
    @Value(value = "${service.placeKey}")
    private String servicePlaceKey;

    public String getApiPlacesData(String type, String contentId, String keyword, String contentTypeId, String categoryCode) throws IOException {
        StringBuilder urlBuilder = new StringBuilder();

        switch (type) {
            case "common":
                urlBuilder.append("https://apis.data.go.kr/B551011/KorService1/detailCommon1").append("?serviceKey=").append(servicePlaceKey)
                    .append("&MobileOS=ETC")
                    .append("&MobileApp=TravelTest")
                    .append("&_type=json")
                    .append("&contentId=").append(URLEncoder.encode(contentId, StandardCharsets.UTF_8))
                    .append("&defaultYN=Y")
                    .append("&firstImageYN=Y")
                    .append("&areacodeYN=Y")
                    .append("&catcodeYN=Y")
                    .append("&addrinfoYN=Y")
                    .append("&mapinfoYN=Y")
                    .append("&overviewYN=Y")
                    .append("&numOfRows=100")
                    .append("&contentTypeId=").append(contentTypeId)
                    .append("&pageNo=1");
                break;

            case "festival":
                urlBuilder.append("https://apis.data.go.kr/B551011/KorService1/searchFestival1")
                        .append("?serviceKey=").append(servicePlaceKey)
                        .append("&MobileOS=ETC")
                        .append("&MobileApp=TravelTest")
                        .append("&numOfRows=100")
                        .append("&pageNo=1")
                        .append("&_type=json")
                        .append("&listYN=Y")
                        .append("&arrange=O")
                        .append("&eventStartDate=20241101");
                break;

            case "stay":
                urlBuilder.append("https://apis.data.go.kr/B551011/KorService1/searchStay1")
                        .append("?serviceKey=").append(servicePlaceKey)
                        .append("&MobileOS=ETC")
                        .append("&MobileApp=TravelTest")
                        .append("&numOfRows=100")
                        .append("&pageNo=1")
                        .append("&_type=json")
                        .append("&listYN=Y")
                        .append("&arrange=O");
                break;

            case "search":
                urlBuilder.append("https://apis.data.go.kr/B551011/KorService1/searchKeyword1")
                    .append("?serviceKey=").append(servicePlaceKey)
                    .append("&keyword=").append(URLEncoder.encode(keyword, StandardCharsets.UTF_8))
                    .append("&MobileOS=ETC")
                    .append("&MobileApp=TravelTest")
                    .append("&numOfRows=100")
                    .append("&pageNo=1")
                    .append("&_type=json")
                    .append("&listYN=Y")
                    .append("&contentTypeId=").append(contentTypeId)
                    .append("&arrange=O");
                break;

            case "areaCode":
                urlBuilder.append("https://apis.data.go.kr/B551011/KorService1/areaCode1")
                        .append("?serviceKey=").append(servicePlaceKey)
                        .append("&MobileOS=ETC")
                        .append("&MobileApp=TravelTest")
                        .append("&numOfRows=20")
                        .append("&pageNo=1")
                        .append("&_type=json");
                break;

            case "areaList":
                urlBuilder.append("https://apis.data.go.kr/B551011/KorService1/areaBasedList1")
                        .append("?serviceKey=").append(servicePlaceKey)
                        .append("&MobileOS=ETC")
                        .append("&MobileApp=TravelTest")
                        .append("&numOfRows=100")
                        .append("&pageNo=1")
                        .append("&areaCode=").append(categoryCode)
                        .append("&_type=json");
                break;

            default:
                throw new IllegalArgumentException("Invalid type: " + type);
        }

        // URL 연결 및 데이터 요청
        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");
        conn.setRequestProperty("Accept", "application/json");

        BufferedReader rd;
        if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
            rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        } else {
            rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
        }

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            sb.append(line);
        }
        rd.close();
        conn.disconnect();

        return sb.toString(); // JSON 데이터 반환
    }

}

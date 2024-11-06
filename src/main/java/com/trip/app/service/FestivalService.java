package com.trip.app.service;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class FestivalService {

    public String getFestivalData() throws IOException {
        StringBuilder urlBuilder = new StringBuilder("https://apis.data.go.kr/B551011/KorService1/searchFestival1");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", StandardCharsets.UTF_8) + "=aEszZJrRS7J3uIHinlD6%2BXf40lXZ0bwXuXsakXfMelXFrpdnIqaKb2r1qffl8v954ZIh2UNtlbh%2FhL0%2B2%2FeV2g%3D%3D");
        urlBuilder.append("&" + URLEncoder.encode("MobileOS", StandardCharsets.UTF_8) + "=" + URLEncoder.encode("ETC", StandardCharsets.UTF_8));
        urlBuilder.append("&" + URLEncoder.encode("MobileApp", StandardCharsets.UTF_8) + "=" + URLEncoder.encode("TravelTest", StandardCharsets.UTF_8));
        urlBuilder.append("&" + URLEncoder.encode("numOfRows", StandardCharsets.UTF_8) + "=" + URLEncoder.encode("50", StandardCharsets.UTF_8));
        urlBuilder.append("&" + URLEncoder.encode("pageNo", StandardCharsets.UTF_8) + "=" + URLEncoder.encode("1", StandardCharsets.UTF_8));
        urlBuilder.append("&" + URLEncoder.encode("_type", StandardCharsets.UTF_8) + "=" + URLEncoder.encode("JSON", StandardCharsets.UTF_8)); // JSON으로 변경
        urlBuilder.append("&" + URLEncoder.encode("listYN", StandardCharsets.UTF_8) + "=" + URLEncoder.encode("Y", StandardCharsets.UTF_8));
        urlBuilder.append("&" + URLEncoder.encode("arrange", StandardCharsets.UTF_8) + "=" + URLEncoder.encode("A", StandardCharsets.UTF_8));
        urlBuilder.append("&" + URLEncoder.encode("eventStartDate", StandardCharsets.UTF_8) + "=" + URLEncoder.encode("20241001", StandardCharsets.UTF_8));

        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");

        BufferedReader rd;
        if(conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
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



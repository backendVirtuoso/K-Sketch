package com.trip.app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trip.app.mapper.TourApiMapper;
import com.trip.app.model.TourApiPlaceDTO;

@Service
public class TourApiService {
    @Value(value = "${service.placeKey}")
    private String servicePlaceKey;

    private final TourApiMapper tourApiMapper;
    private final ObjectMapper objectMapper;

    public TourApiService(TourApiMapper tourApiMapper, ObjectMapper objectMapper) {
        this.tourApiMapper = tourApiMapper;
        this.objectMapper = objectMapper;
    }

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
                        .append("&eventStartDate=20250101");
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

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void syncTourApiData() throws IOException {
        int pageNo = 1;
        int totalCount = 0;
        List<TourApiPlaceDTO> places = new ArrayList<>();

        try {
            do {
                System.out.println("페이지 " + pageNo + " 데이터 요청 시작");
                // areaBasedList API 사용, 파라미터를 모두 null로 설정하여 모든 데이터 조회
                String response = getApiPlacesData("areaList", null, null, null, null);
                System.out.println("API 응답 데이터: " + response);

                JsonNode responseJson = objectMapper.readTree(response);
                JsonNode body = responseJson.path("response").path("body");

                if (totalCount == 0) {
                    totalCount = body.path("totalCount").asInt();
                    System.out.println("총 데이터 수: " + totalCount);
                }

                JsonNode items = body.path("items").path("item");
                if (items.isEmpty()) {
                    System.out.println("더 이상 데이터가 없습니다.");
                    break;
                }

                System.out.println("현재 페이지 아이템 수: " + items.size());

                for (JsonNode item : items) {
                    String contentId = item.path("contentid").asText();
                    System.out.println("처리 중인 contentId: " + contentId);

                    if (!tourApiMapper.existsByContentId(contentId)) {
                        TourApiPlaceDTO place = new TourApiPlaceDTO();
                        place.setContentId(contentId);
                        place.setTitle(item.path("title").asText());
                        place.setTel(item.path("tel").asText());
                        place.setAddr1(item.path("addr1").asText());
                        place.setAddr2(item.path("addr2").asText());
                        place.setFirst_image(item.path("first_image").asText());
                        place.setFirstImage2(item.path("firstimage2").asText());
                        place.setMapx(item.path("mapx").asDouble());
                        place.setMapy(item.path("mapy").asDouble());
                        place.setContentTypeId(item.path("contenttypeid").asText());
                        place.setCat1(item.path("cat1").asText());
                        place.setCat2(item.path("cat2").asText());
                        place.setCat3(item.path("cat3").asText());
                        place.setOrderNo(item.path("order").asInt());
                        place.setMlevel(item.path("mlevel").asText());
                        place.setAreacode(item.path("areacode").asText());
                        place.setBooktour(item.path("booktour").asText());
                        place.setCpyrhtDivCd(item.path("cpyrhtDivCd").asText());
                        place.setCreatedtime(item.path("createdtime").asText());
                        place.setModifiedtime(item.path("modifiedtime").asText());
                        place.setSigungucode(item.path("sigungucode").asText());

                        places.add(place);
                        System.out.println("장소 추가됨: " + place.getTitle());
                    }

                    if (places.size() >= 1000) { // 1000개씩 배치 처리
                        System.out.println("1000개 데이터 저장 시도");
                        tourApiMapper.insertPlaces(places);
                        System.out.println("데이터 저장 완료");
                        places.clear();
                    }
                }

                pageNo++;

            } while (true); // 페이지 제한 제거

            if (!places.isEmpty()) {
                System.out.println("남은 데이터 저장 시도: " + places.size() + "개");
                tourApiMapper.insertPlaces(places);
                System.out.println("남은 데이터 저장 완료");
            }

        } catch (Exception e) {
            System.err.println("에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<TourApiPlaceDTO> searchPlacesFromDb(String keyword, String contentTypeId, String areaCode, int page, int size) {
        try {
            int start = (page - 1) * size;
            return tourApiMapper.searchPlaces(keyword, contentTypeId, areaCode, start, size);
        } catch (Exception e) {
            System.err.println("데이터베이스 검색 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch data from database", e);
        }
    }

    public int countPlacesFromDb(String keyword, String contentTypeId, String areaCode) {
        try {
            return tourApiMapper.countPlaces(keyword, contentTypeId, areaCode);
        } catch (Exception e) {
            System.err.println("데이터베이스 마운트 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to count data from database", e);
        }
    }

}

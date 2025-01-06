package com.trip.app.tourapi;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.trip.app.mapper.TourApiMapper;
import com.trip.app.service.TourApiService;

@SpringBootTest
public class TourApiServiceTest {

    @Autowired
    private TourApiService tourApiService;
    
    @Autowired
    private TourApiMapper tourApiMapper;

    @Test
    @DisplayName("Tour API 데이터 동기화 테스트")
    public void syncTourApiDataTest() throws Exception {
        try {
            System.out.println("데이터 동기화 시작");
            tourApiService.syncTourApiData();
            System.out.println("데이터 동기화 완료");
            
            int totalCount = tourApiMapper.countPlaces(null, null);
            System.out.println("동기화된 총 데이터 수: " + totalCount);
            
            assert totalCount > 0 : "데이터가 저장되지 않았습니다.";
        } catch (Exception e) {
            System.err.println("에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
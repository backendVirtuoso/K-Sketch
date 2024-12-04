package com.trip.app.controller;

import com.trip.app.model.BannerDTO;
import com.trip.app.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/main")
public class MainController {
    @Autowired
    private AdminService adminService;

    // 모든 배너 가져오기
    @GetMapping("banners")
    public ResponseEntity<List<BannerDTO>> getAllBanners() {
        List<BannerDTO> banners = adminService.getAllBanners();

        // Base64로 인코딩된 이미지 데이터 설정
        for (BannerDTO banner : banners) {
            String base64Image = Base64.getEncoder().encodeToString(banner.getImage());
            banner.setImageName("data:image/jpeg;base64," + base64Image); // Base64 URL 설정
        }

        return ResponseEntity.ok(banners);
    }

}

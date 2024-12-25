package com.trip.app.controller;

import com.trip.app.model.BannerDTO;
import com.trip.app.model.MemberDTO;
import com.trip.app.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // 반환 타입을 List<MemberDTO>로 수정
    @GetMapping("/users")
    public List<MemberDTO> getAllUsers() {
        return adminService.getAllUsers();
    }

    // 특정 사용자 정보 조회
    @GetMapping("/userinfo/{loginId}")
    public MemberDTO getUserByLoginId(@PathVariable String loginId) {
        return adminService.getUserByLoginId(loginId);
    }

    // 사용자 정보 수정
    @PostMapping("/userinfo-Modify")
    public int updateUser(@RequestBody MemberDTO memberDTO) {
        return adminService.updateUser(memberDTO);
    }

    // 배너 이미지 업로드
    @PostMapping("banner/upload")
    public ResponseEntity<String> uploadBanner(@RequestParam("file") MultipartFile file) {
        try {
            adminService.saveBanner(file);
            return ResponseEntity.ok("배너 업로드 성공");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("배너 업로드 실패");
        }
    }

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

    @DeleteMapping("banner/{id}")
    public ResponseEntity<String> deleteBanner(@PathVariable Long id) {
        try {
            adminService.deleteBanner(id);
            return ResponseEntity.ok("배너 삭제 성공");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("배너 삭제 실패");
        }
    }
}

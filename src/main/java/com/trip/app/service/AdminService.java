package com.trip.app.service;

import com.trip.app.model.BannerDTO;
import com.trip.app.model.MemberDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface AdminService {
    List<MemberDTO> getAllUsers(); // 사용자 목록 조회

    // 사용자 정보 수정
    int updateUser(MemberDTO memberDTO);

    // 사용자 정보 조회
    MemberDTO getUserByLoginId(String loginId);

    void saveBanner(MultipartFile file) throws IOException;

    BannerDTO getBannerById(Long id);

    List<BannerDTO> getAllBanners(); // 배너 목록 조회

    void deleteBanner(Long id); // 배너 삭제
}

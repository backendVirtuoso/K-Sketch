package com.trip.app.service;

import com.trip.app.mapper.AdminMapper;
import com.trip.app.model.BannerDTO;
import com.trip.app.model.MemberDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminMapper adminMapper;

    @Override
    public List<MemberDTO> getAllUsers() {
        return adminMapper.getAllUsers();
    }

    @Override
    public int updateUser(MemberDTO memberDTO) {
        // 아이디로 사용자 정보 조회 후, 존재하는 사용자만 수정
        MemberDTO existingUser = adminMapper.getUserByLoginId(memberDTO.getLoginId());
        if (existingUser != null) {
            return adminMapper.updateUser(memberDTO);
        }
        return 0;  // 사용자 정보가 없으면 수정하지 않음
    }

    @Override
    public MemberDTO getUserByLoginId(String loginId) {
        return adminMapper.getUserByLoginId(loginId);
    }

    @Override
    public void saveBanner(MultipartFile file) throws IOException {
        // 파일을 byte[]로 변환
        byte[] imageBytes = file.getBytes();
        String imageName = file.getOriginalFilename();

        // 배너 정보 DB에 저장
        adminMapper.insertBanner(imageBytes, imageName);
    }

    @Override
    public BannerDTO getBannerById(Long id) {
        return adminMapper.getBannerById(id);
    }

    @Override
    public List<BannerDTO> getAllBanners() {
        return adminMapper.getAllBanners(); // 모든 배너 조회
    }

    @Override
    public void deleteBanner(Long id) {
        adminMapper.deleteBanner(id); // 배너 삭제
    }
}

package com.trip.app.mapper;

import com.trip.app.model.BannerDTO;
import com.trip.app.model.MemberDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminMapper {
    // 사용자 정보를 MemberDTO 형태로 반환
    List<MemberDTO> getAllUsers();

    // 특정 사용자 정보 조회
    MemberDTO getUserByLoginId(String loginId);

    // 사용자 정보 수정
    int updateUser(MemberDTO memberDTO);

    // 배너 추가
    void insertBanner(@Param("image") byte[] image, @Param("imageName") String imageName);

    // 배너 조회
    BannerDTO getBannerById(@Param("id") Long id);

    // 모든 배너 조회
    List<BannerDTO> getAllBanners(); // 배너 목록 조회

    // 배너 삭제
    void deleteBanner(Long id);
}

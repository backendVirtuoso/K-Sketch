package com.trip.app.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LikeMapper {
    // 변수 두개이상 보낼때 @Param 으로 명시해줘야함 명시안해주면 에러
    void insertLike(@Param("seqNum") int seqNum, @Param("title")String title);
    // 장소 좋아요 업데이트
    void updatePlaceLikes(@Param("title") String title, @Param("lat") double lat, @Param("lon") double lon);
}

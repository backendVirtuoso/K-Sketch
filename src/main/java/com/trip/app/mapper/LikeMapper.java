package com.trip.app.mapper;

import com.trip.app.model.LikeListDTO;
import com.trip.app.model.TourApiPlaceDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface LikeMapper {
    // 변수 두개이상 보낼때 @Param 으로 명시해줘야함 명시안해주면 에러
    void insertLike(@Param("seqNum") int seqNum, @Param("title")String title);
    // 장소 좋아요 업데이트
    void updatePlaceLikes(@Param("title") String title, @Param("lat") double lat, @Param("lon") double lon);
    // 좋아요 목록
    List<LikeListDTO> likeList(@Param("seqNum") int seqNum);
    // 좋아요 목록에서 장소이름으로 tour_api_data 데이터에 접근해서 장소에관한 값들을 가져옴
    List<TourApiPlaceDTO> findPlaceByTitles(@Param("titles") List<String> titles);
}

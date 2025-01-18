package com.trip.app.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.trip.app.model.TourApiPlaceDTO;

import java.util.List;

@Mapper
public interface TourApiMapper {
    void insertPlace(TourApiPlaceDTO place);

    void insertPlaces(List<TourApiPlaceDTO> places);

    List<TourApiPlaceDTO> searchPlaces(
        @Param("keyword") String keyword, 
        @Param("contentTypeId") String contentTypeId,
        @Param("areaCode") String areaCode,
        @Param("start") int start, 
        @Param("size") int size
    );

    int countPlaces(
        @Param("keyword") String keyword, 
        @Param("contentTypeId") String contentTypeId,
        @Param("areaCode") String areaCode
    );

    boolean existsByContentId(String contentId);

    List<TourApiPlaceDTO> getStayPlaces(
        @Param("keyword") String keyword,
        @Param("start") int start,
        @Param("size") int size
    );
}
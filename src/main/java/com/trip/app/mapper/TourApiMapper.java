package com.trip.app.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.trip.app.model.TourApiPlaceDTO;

import java.util.List;

@Mapper
public interface TourApiMapper {
    void insertPlace(TourApiPlaceDTO place);
    void insertPlaces(List<TourApiPlaceDTO> places);
    List<TourApiPlaceDTO> searchPlaces(@Param("keyword") String keyword, 
                                      @Param("contentTypeId") String contentTypeId,
                                      @Param("start") int start,
                                      @Param("size") int size);
    int countPlaces(@Param("keyword") String keyword, 
                   @Param("contentTypeId") String contentTypeId);
    boolean existsByContentId(String contentId);
} 
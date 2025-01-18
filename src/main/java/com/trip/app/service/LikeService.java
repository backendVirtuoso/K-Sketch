package com.trip.app.service;

import com.trip.app.model.LikeListDTO;
import com.trip.app.model.TourApiPlaceDTO;
import java.util.List;

public interface LikeService {

    void registLike(int seqNum, String title, double lat, double lon);

    List<LikeListDTO> userLikeList(int seqNum);

    List<TourApiPlaceDTO> placeDetail(List<String> titles);

    List<String> getUserLikes(int seqNum);

    int getLikesCount(String title);

}

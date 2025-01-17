package com.trip.app.service;

import java.util.List;

public interface LikeService {

    void registLike(int seqNum, String title, double lat, double lon);

    List<String> getUserLikes(int seqNum);

    int getLikesCount(String title);

}

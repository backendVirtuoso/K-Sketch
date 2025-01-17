package com.trip.app.service;

import com.trip.app.mapper.LikeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class LikeServiceImpl implements LikeService {

    @Autowired
    private LikeMapper likeMapper;


    @Override
    @Transactional
    public void registLike(int seqNum, String title, double lat, double lon) {
        System.out.println("ServiceImple");
        System.out.println("seqNum : " +seqNum+ "title : " +title);
        // 사용자 좋아요 등록
        likeMapper.insertLike(seqNum, title);
        // 장소 좋아요 수 업데이트
        likeMapper.updatePlaceLikes(title, lat, lon);
    }

    @Override
    public List<String> getUserLikes(int seqNum) {
        return likeMapper.getUserLikes(seqNum);
    }

    @Override
    public int getLikesCount(String title) {
        return likeMapper.getLikesCount(title);
    }
}

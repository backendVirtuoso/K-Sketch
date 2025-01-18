package com.trip.app.controller;

import com.trip.app.model.LikeListDTO;
import com.trip.app.model.TourApiPlaceDTO;
import com.trip.app.service.LikeService;
import com.trip.app.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/like")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @Autowired
    private MemberService memberService;

    @PostMapping("/userLike")
    public ResponseEntity<String> userLike(@RequestBody Map<String, Object> data){
        String title = (String) data.get("title");
        String id = (String) data.get("id");
        double lat = Double.parseDouble((String) data.get("lat"));
        double lon = Double.parseDouble((String) data.get("lon"));
        System.out.println("로그인한 사용자 아이디 : " + id + " 좋아요 누른 장소 : " +title+
                "위도 : " +lat+ "경도 : " +lon);

        try{
            int seqNum = memberService.findSeqNum(id);
            System.out.println("로그인한 유저의 시퀀스 넘버 : " +seqNum);
            likeService.registLike(seqNum, title, lat, lon);
            return ResponseEntity.ok("입력 성공");
        } catch(Exception e){
            e.printStackTrace();
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body("입력 실패");
        }

    }

    @PostMapping("userLikeList")
    public List<LikeListDTO> getLikeList(@RequestBody Map<String, Object> data){
        String loginId = (String) data.get("id");
        try{
            int seqNum = memberService.findSeqNum(loginId);
            List<LikeListDTO> userLikeList = likeService.userLikeList(seqNum);

            return userLikeList;
        } catch(Exception e){
            e.printStackTrace();
            System.out.println(e.getMessage());
            return null;
        }
    }

    @PostMapping("likePlaceList")
    public List<TourApiPlaceDTO> getLikePlaceList(@RequestBody Map<String, Object> data) {
        String title = (String) data.get("title");
        List<String> titles = Arrays.asList(title.split(","));

        List<TourApiPlaceDTO> placeDTOS = likeService.placeDetail(titles);
        System.out.println(placeDTOS);
        return placeDTOS;
    }

    @GetMapping("/check")
    public ResponseEntity<List<String>> getUserLikes(@RequestParam("id") String id) {
        try {
            int seqNum = memberService.findSeqNum(id);
            List<String> userLikes = likeService.getUserLikes(seqNum);
            return ResponseEntity.ok(userLikes);
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getLikesCount(@RequestParam("title") String title) {
        try {
            int count = likeService.getLikesCount(title);
            System.out.println("좋아요 개수 : " + count);
            return ResponseEntity.ok(count);
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(0);
        }
    }

}

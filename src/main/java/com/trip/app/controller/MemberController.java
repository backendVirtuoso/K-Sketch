package com.trip.app.controller;

import com.trip.app.model.MemberDTO;
import com.trip.app.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MemberController {

    @Autowired
    private MemberService memberService;

    @PostMapping("/api/join")
    public int joinMember(@RequestBody MemberDTO memberDTO) {
        System.out.println("여기까지 보자: " + memberDTO);
        // 회원가입 처리 후 성공/실패 값 반환
        return memberService.regist(memberDTO);
    }
}

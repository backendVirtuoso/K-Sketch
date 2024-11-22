package com.trip.app.service;

import com.trip.app.model.MemberDTO;

public interface MemberService {
    // 회원가입
    int regist(MemberDTO memberDTO);
    // 아이디 중복 확인
    int checkDuplicateId(String loginId);
    // 이메일 중복 확인
    int checkDuplicateEmail(String email);
    // 이메일로 아이디 찾기
    MemberDTO findIdByNameAndEmail(String name, String email);
    // 이메일로 아이디 찾기
    MemberDTO findPwByIdAndEmail(String loginId, String email);
    // 비밀번호 재설정
    boolean updatePassword(MemberDTO memberDTO);
}

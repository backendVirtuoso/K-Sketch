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
    // 유저 정보 확인
    MemberDTO findByUsername(String username); // 사용자 정보 조회
    // 사용자 정보 수정
    boolean updateUserInfo(MemberDTO memberDTO);
    // 로그인한 사용자 시퀀스넘버
    int findSeqNum(String id);
}

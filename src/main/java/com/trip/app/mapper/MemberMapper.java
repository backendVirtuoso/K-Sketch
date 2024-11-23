package com.trip.app.mapper;

import com.trip.app.model.MemberDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MemberMapper {
    // 회원가입
    int memberSave(MemberDTO memberDTO);

    // 사용자가 입력한 아이디가 데이터베이스에 존재하는지 찾는 메서드
    MemberDTO findByUsername(String username);

    // 아이디 중복 확인
    MemberDTO checkDuplicateId(String loginId);

    // 이메일 중복 확인
    MemberDTO checkDuplicateEmail(String email);

    // 이메일로 아이디 찾기
    MemberDTO findIdByNameAndEmail(@Param("name") String name, @Param("email") String email);

    // 이메일로 아이디 찾기
    MemberDTO findPwByIdAndEmail(@Param("loginId") String loginId, @Param("email") String email);

    // 비밀번호 재설정
    int updatePassword(MemberDTO memberDTO);
}

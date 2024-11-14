package com.trip.app.mapper;

import com.trip.app.model.MemberDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MemberMapper {
    // 회원가입
    int memberSave(MemberDTO memberDTO);
    // 사용자가 입력한 아이디가 데이터베이스에 존재하는지 찾는 메서드
    MemberDTO findByUsername(String username);
}


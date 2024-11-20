package com.trip.app.service;

import com.trip.app.mapper.MemberMapper;
import com.trip.app.model.MemberDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class MemberServiceImpl implements MemberService, UserDetailsService {

    @Autowired
    private MemberMapper memberMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder; // 비밀번호 암호화를 위함

    @Override
    public int regist(MemberDTO memberDTO) {
        try {
            // 비밀번호 암호화
            String encodedPassword = passwordEncoder.encode(memberDTO.getPassword());
            memberDTO.setPassword(encodedPassword);

            // 회원 저장
            int result = memberMapper.memberSave(memberDTO);
            return result > 0 ? 1 : 0;  // 성공 시 1 반환, 실패 시 0 반환
        } catch (Exception e) {
            e.printStackTrace();
            return 0; // 예외가 발생하면 실패 반환
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        MemberDTO memberData = memberMapper.findByUsername(username);

        if (memberData != null) {
            return new CustomUserDetails(memberData);
        }

        throw new UsernameNotFoundException("User not found with username: " + username);
    }

    @Override
    public int checkDuplicateId(String loginId) {
        // 아이디 중복 여부 체크
        MemberDTO memberDTO = memberMapper.checkDuplicateId(loginId);
        return (memberDTO != null) ? 1 : 0;  // 중복되면 1 반환, 없으면 0 반환
    }

    @Override
    public int checkDuplicateEmail(String email) {
        // 이메일 중복 여부 체크
        MemberDTO memberDTO = memberMapper.checkDuplicateEmail(email);
        return (memberDTO != null) ? 1 : 0;  // 중복되면 1 반환, 없으면 0 반환
    }
    @Override
    public MemberDTO findIdByNameAndEmail(String name, String email) {
        // 이메일과 이름으로 아이디와 생성일자를 찾음
        return memberMapper.findIdByNameAndEmail(name, email);
    }
    @Override
    public MemberDTO findPwByIdAndEmail(String loginId, String email) {
        // 이메일과 아이디로 아이디와 생성일자를 찾음
        return memberMapper.findPwByIdAndEmail(loginId, email);
    }

    @Override
    public boolean updatePassword(MemberDTO memberDTO) {
        try {
            // 비밀번호 암호화
            String encodedPassword = passwordEncoder.encode(memberDTO.getPassword());
            memberDTO.setPassword(encodedPassword);

            // 비밀번호 업데이트 쿼리 실행
            int result = memberMapper.updatePassword(memberDTO);
            return result > 0;  // 업데이트 성공 시 true, 실패 시 false
        } catch (Exception e) {
            e.printStackTrace();
            return false;  // 예외 발생 시 false 반환
        }
    }

}

package com.trip.app.service;

import com.trip.app.mapper.MemberMapper;
import com.trip.app.model.MemberDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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
}

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
    public void regist(MemberDTO memberDTO) {
        // 폼에서 작성된 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(memberDTO.getPassword());
        // 암호화된 비밀번호 재설정
        memberDTO.setPassword(encodedPassword);

        memberMapper.memberSave(memberDTO);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        MemberDTO memberData = memberMapper.findByUsername(username);

        if(memberData != null) {
            return new CustomUserDetails(memberData);
        }

        throw new UsernameNotFoundException("User not found with username: " + username);
    }

}


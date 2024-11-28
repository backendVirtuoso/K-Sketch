package com.trip.app.service;

import com.trip.app.mapper.MemberMapper;
import com.trip.app.model.*;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberMapper memberMapper; // MyBatis 매퍼

    public CustomOAuth2UserService(MemberMapper memberMapper) {
        this.memberMapper = memberMapper;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 기본 사용자 정보 가져오기
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        System.out.println("Registration ID: " + registrationId); // 등록된 OAuth2 제공자 ID 출력

        OAuth2ResPonse oAuth2Response;

        // OAuth2 제공자별로 사용자 정보를 처리
        if ("naver".equals(registrationId)) {
            oAuth2Response = new NaverResponse(oAuth2User.getAttributes());
            System.out.println("Naver Response: " + oAuth2Response); // Naver에서 받은 응답 출력
        } else if ("google".equals(registrationId)) {
            oAuth2Response = new GoogleResponse(oAuth2User.getAttributes());
            System.out.println("Google Response: " + oAuth2Response); // Google에서 받은 응답 출력
        } else if ("kakao".equals(registrationId)) {
            oAuth2Response = new KakaoResponse(oAuth2User.getAttributes());
            System.out.println("Kakao Response: " + oAuth2Response); // Kakao에서 받은 응답 출력
        } else {
            throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        }

        // OAuth2 정보를 기반으로 고유한 사용자 아이디 생성
        String username = oAuth2Response.getProvider() + " " + oAuth2Response.getProviderId();
        System.out.println("Generated Username: " + username); // 생성된 사용자 이름 출력

        // 사용자 정보 가져오기 (DB 조회)
        MemberDTO existingMember = memberMapper.findByUsername(username);
        if (existingMember != null) {
            System.out.println("Existing Member Found: " + existingMember); // 기존 사용자 정보 출력
        } else {
            System.out.println("No Existing Member Found, Creating New Member"); // 새로운 사용자가 없으면 출력
        }

        if (existingMember == null) {
            // 신규 사용자: 사용자 정보 저장
            MemberDTO newMember = new MemberDTO();
            newMember.setLoginId(username);
            newMember.setName(oAuth2Response.getName());
            newMember.setEmail(oAuth2Response.getEmail());
            newMember.setRole("ROLE_USER");

            System.out.println("New Member Details: " + newMember); // 새 사용자 정보 출력

            memberMapper.memberSave(newMember);
            return new CustomOAuth2User(newMember); // CustomOAuth2User로 반환
        } else {
            // 기존 사용자: 정보 업데이트
            existingMember.setName(oAuth2Response.getName());
            existingMember.setEmail(oAuth2Response.getEmail());
            System.out.println("Updated Member Details: " + existingMember); // 기존 사용자 정보 업데이트 후 출력

            memberMapper.updatePassword(existingMember); // 업데이트 메서드 사용 (예: 이름, 이메일 변경)

            return new CustomOAuth2User(existingMember); // CustomOAuth2User로 반환
        }
    }
}

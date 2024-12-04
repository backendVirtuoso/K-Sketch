package com.trip.app.model;

import java.util.Map;

public class KakaoResponse implements OAuth2ResPonse {

    private final Map<String, Object> attributes;

    public KakaoResponse(Map<String, Object> attributes) {
        // Kakao 응답 구조에 따라 "kakao_account" 및 "properties"를 분리
        this.attributes = attributes;
    }

    @Override
    public String getProvider() {
        return "kakao";
    }

    @Override
    public String getProviderId() {
        // Kakao에서 사용자 고유 ID는 "id" 필드에 있음
        return attributes.get("id").toString();
    }

    @Override
    public String getEmail() {
       return null;
    }

    @Override
    public String getName() {
        // 사용자 이름은 "properties" 하위에 있음
        Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
        return properties != null && properties.containsKey("nickname") ? properties.get("nickname").toString() : null;
    }
}

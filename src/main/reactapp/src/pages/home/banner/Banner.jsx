import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Carousel } from 'react-bootstrap';
import './Banner.style.css';

// CORS 우회 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'https://port-0-backend-m8uaask821ad767f.sel4.cloudtype.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

const Banner = () => {
  const [banners, setBanners] = useState([]); // 초기값을 빈 배열로 설정

  // 배너 목록 조회 함수
  const fetchBanners = async () => {
    try {
      const response = await apiClient.get('/api/main/banners');
      setBanners(response.data);
    } catch (error) {
      console.error("배너 목록을 가져오는 데 실패했습니다:", error);
    }
  };

  useEffect(() => {
    fetchBanners(); // 컴포넌트가 마운트될 때 배너 목록 가져오기
  }, []);

  return (
    <div>
      {Array.isArray(banners) && banners.length > 0 ? (
        <Carousel data-bs-theme="dark">
          {banners.map((banner, index) => (
            <Carousel.Item key={index}>
              <img
                className="d-block w-100"
                src={banner.imageName} // Base64 URL 사용
                alt={`Slide ${index + 1}`}
                style={{ height: '600px', objectFit: 'cover' }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <p>로딩중...</p>
      )}
    </div>
  );
};

export default Banner
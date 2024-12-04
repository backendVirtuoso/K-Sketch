import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col, Button } from 'react-bootstrap';

const AdminBannerSet = () => {
  const [file, setFile] = useState(null);
  const [banners, setBanners] = useState([]);

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 배너 업로드 핸들러
  const handleUpload = async () => {
    if (!file) {
      alert("파일을 선택하세요!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token"); // JWT 토큰 가져오기
      const response = await axios.post('http://localhost:8080/api/admin/banner/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // JWT 토큰 추가
        },
      });
      alert("배너 업로드 성공");
      setFile(null); // 파일 상태 초기화
      fetchBanners(); // 배너 목록 갱신
    } catch (error) {
      console.error("배너 업로드 실패:", error);
      alert("배너 업로드 실패");
    }
  };

  // 배너 목록 조회 함수
  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem("token"); // JWT 토큰 가져오기
      const response = await axios.get('http://localhost:8080/api/admin/banners', {
        headers: {
          'Authorization': `Bearer ${token}`, // JWT 토큰 추가
        },
      });
      setBanners(response.data); // 배너 목록을 상태에 저장
    } catch (error) {
      console.error("배너 목록을 가져오는 데 실패했습니다:", error);
    }
  };

  useEffect(() => {
    fetchBanners(); // 컴포넌트가 마운트될 때 배너 목록 가져오기
  }, []);

  return (
    <div>
      <h2>배너 설정</h2>

      {/* 배너 업로드 섹션 */}
      <div className="mb-4">
        <h3>배너 업로드</h3>
        <input type="file" onChange={handleFileChange} />
        <Button variant="primary" onClick={handleUpload}>배너 업로드</Button>
      </div>

      {/* 배너 목록 섹션 (리스트 형식) */}
      <div>
        <h3>배너 목록</h3>
        {Array.isArray(banners) && banners.length > 0 ? (
          <Row>
            {banners.map((banner, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card>
                  <Card.Img
                    variant="top"
                    src={`http://localhost:8080${banner.imageUrl}`} // 서버에서 반환된 이미지 URL 사용
                    alt={`Banner ${index + 1}`}
                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Text>배너 {index + 1}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p>설정된 배너가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default AdminBannerSet;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { FaTrashAlt } from 'react-icons/fa';

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
      const token = localStorage.getItem("token");
      const response = await axios.post('https://port-0-backend-m8uaask821ad767f.sel4.cloudtype.app/api/admin/banner/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      alert("배너 업로드 성공");
      setFile(null);
      fetchBanners();
    } catch (error) {
      console.error("배너 업로드 실패:", error);
      alert("배너 업로드 실패");
    }
  };

  // 배너 삭제 핸들러
  const handleDelete = async (bannerId) => {
    if (!window.confirm("정말 이 배너를 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://port-0-backend-m8uaask821ad767f.sel4.cloudtype.app/api/admin/banner/${bannerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      alert("배너 삭제 성공");
      fetchBanners();
    } catch (error) {
      console.error("배너 삭제 실패:", error);
      alert("배너 삭제 실패");
    }
  };

  // 배너 목록 조회 함수
  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('https://port-0-backend-m8uaask821ad767f.sel4.cloudtype.app/api/admin/banners', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setBanners(response.data);
    } catch (error) {
      console.error("배너 목록을 가져오는 데 실패했습니다:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <Container>
      <h2 className="text-center my-4" style={{ paddingBottom: '100px', color: '#87CEFA', fontWeight: 'bold' }}>배너 설정</h2>

      {/* 배너 업로드 섹션 */}
      <div className="mb-4 text-center" style={{ paddingBottom: '70px' }}>
        <h3>배너 추가</h3>
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <Button
          variant="primary"
          onClick={handleUpload}
          className="px-4 py-2"
          style={{ fontSize: '16px' }}
        >
          배너 업로드
        </Button>
      </div>

      {/* 배너 목록 섹션 */}
      <div>
        <h3 className="text-center mb-3">배너 목록</h3>
        {Array.isArray(banners) && banners.length > 0 ? (
          <Row style={{ marginBottom: '100px' }}>
            {banners.map((banner) => (
              <Col xs={12} md={6} lg={4} className="mb-4" key={banner.id}>
                <Card className="shadow-lg rounded">
                  <Card.Img
                    variant="top"
                    src={banner.imageName} // Base64 데이터 사용
                    alt={`Banner ${banner.id}`}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Text className="text-center">
                      <strong>배너 {banner.id}</strong>
                    </Card.Text>
                    <div className="text-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(banner.id)}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <FaTrashAlt className="mr-2" /> 삭제
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p className="text-center">설정된 배너가 없습니다.</p>
        )}
      </div>
    </Container>
  );
};

export default AdminBannerSet;

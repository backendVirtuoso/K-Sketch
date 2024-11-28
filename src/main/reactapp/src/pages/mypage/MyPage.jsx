import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Button, Image, Form, Modal } from "react-bootstrap";
import "./MyPage.style.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import BookMark from './bookmark/BookMark';
import Loading from '../../common/Loading';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { confirmModal } from "../../reducer/confirmModal";

const MyPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [travelData, setTravelData] = useState([]); // 여행 데이터 상태 추가
  const [isLoading, setIsLoading] = useState(true); 
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

    //  컨펌모달 매서드
    const confirmModalMethod = (msg, msg2) => {
      const obj = {
        isConfirmModal: true,
        isMsg: msg,
        isMsg2: msg2,
      };
      dispatch(confirmModal(obj));
    };

    useEffect(() => {
      const token = localStorage.getItem("token");
    
      setTimeout(() => {
        setIsLoading(false); // 2초 후 로딩 상태 종료
      }, 2000);
    
      if (!token) {
        confirmModalMethod("로그인이 필요한 서비스입니다.");
        navigate('/login');
      }
      axios
        .get("http://localhost:8080/api/userinfo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log(response.data);
          setUserInfo(response.data);
          setTravelData(response.data.travels || []);
        })
        .catch((err) => {
          console.error("사용자 정보 요청 실패:", err);
          setError("사용자 정보를 불러오는 데 실패했습니다.");
        });
    }, [navigate]);

    const handleUserInfoChange = (e) => {
      e.preventDefault();
      navigate('/userInfoModify');
    };
    

  return (
    <div>
      <Container>
      {userInfo ?(
        <Row>
          {/* 카테고리 버튼 */}
          <Col lg={3} md={6} xs={12}>
            <div className="mypage-1st-col">
              {/* 프로필 이미지 */}
              <div className="profile-section text-center">
                <Image
                  src="https://png.pngtree.com/png-vector/20220220/ourmid/pngtree-pixel-art-character-little-boy-with-backpack-from-the-side-view-png-image_4408615.png" // Mario 이미지 URL 대체
                  roundedCircle
                  className="profile-img"
                  alt="프로필 이미지"
                />
                <h5 className="mt-3">{userInfo.name}</h5>
                <p className="countdown">D - 1</p>
                <p className="mypage-p"><strong>{userInfo.name}</strong>의 n번째 </p>
                <p className="mypage-p">여행 하루 전입니다!</p>
              </div>
              <div className="button-section text-center mt-4 buttonflex">
                <Button variant="outline-primary" className="mb-2 mypage-button-1" onClick={handleUserInfoChange} block>
                  개인정보 수정
                </Button>
                <Button variant="outline-secondary"className="mypage-button-1" block>
                  나의 이전 여행
                </Button>
              </div>
            </div>
          </Col>

     
          <Col lg={9} xs={12}>
            <div className="travel-list-section">
             
              <div className="mypage-font-style">
                <FontAwesomeIcon icon={faAngleRight} /> 마이페이지
              </div>
              {isLoading ? (
                <div className="loading-text"><Loading/></div> 
              ) : (
                <BookMark /> // 데이터가 로딩되면 실제 내용 표시
              )}
            </div>
          </Col>
        </Row>
       ) : (
        <div>사용자 정보가 없습니다.</div>
      )}
      </Container>

      {/* 모달
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>개인정보 수정</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>이름:</Form.Label>
              <Form.Control type="text" placeholder="이름 입력" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>아이디:</Form.Label>
              <Form.Control type="text" placeholder="아이디 입력" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>비밀번호 변경:</Form.Label>
              <Form.Control type="password" placeholder="새 비밀번호 입력" />
            </Form.Group>
            <div className="text-end">
              <Button variant="primary" onClick={handleCloseModal}>
                확인
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal> */}
    </div>
  );
};

export default MyPage;

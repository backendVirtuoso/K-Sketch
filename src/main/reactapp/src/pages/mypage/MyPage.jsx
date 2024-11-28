import React, { useState } from 'react';
import { Col, Container, Row, Button, Image, Form, Modal } from "react-bootstrap";
import "./MyPage.style.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import BookMark from './bookmark/BookMark';

const MyPage = () => {

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  return (
    <div>
      <Container>
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
                <h5 className="mt-3">이름</h5>
                <p className="countdown">D - 1</p>
                <p className="mypage-p">김○○님의 n번째 </p>
                <p className="mypage-p">여행 하루 전입니다!</p>
              </div>
              <div className="button-section text-center mt-4 buttonflex">
                <Button variant="outline-primary" className="mb-2 mypage-button-1" onClick={handleOpenModal} block>
                  개인정보 수정
                </Button>
                <Button variant="outline-secondary"className="mypage-button-1" block>
                  나의 이전 여행
                </Button>
              </div>
            </div>
          </Col>

          {/* 여행 카드 리스트 */}
          <Col lg={9} xs={12}>
            <div className="travel-list-section">
              {/* 여행 카드 리스트 내용 */}
             <div className="mypage-font-style"><FontAwesomeIcon icon={faAngleRight} /> 마이페이지</div>
<BookMark/>
             
            </div>
          </Col>
        </Row>
      </Container>


      {/* 모달 */}
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
      </Modal>
    </div>
  );
};

export default MyPage;

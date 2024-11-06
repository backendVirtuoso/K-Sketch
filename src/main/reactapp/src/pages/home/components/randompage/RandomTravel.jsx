import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import './RandomTravel.style.css';
import { Col, Row, Button } from "react-bootstrap";

const Container = styled.div`
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f9f9f9;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 1em;
`;

const Error = styled.p`
  color: #d9534f;
  text-align: center;
  font-weight: bold;
`;

const RandomTravel = () => {
  const [datas, setDatas] = useState([]);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=yrgC%2B43SMF1XX%2Bb2wdT%2FLStUfM%2BUtudnH1zLiN40e0zQPaLsA7YUt6A1pdgBhSOE0YFbj0Q92OgugmuP9Yjcxg%3D%3D&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=TestApp&_type=json"
      );

      setDatas(response.data.response.body.items.item);
      console.log(response.data.response.body.items.item);
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  const goMore = () => {
    // Logic for navigating to more details can go here
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Randomly select a travel item
  const randomItem = datas.length > 0 ? datas[Math.floor(Math.random() * datas.length)] : null;

  return (
    <div>
      <div className="random-title"><span className="random-title-a">'국내천국'</span><span className="random-title-b">표 쉬운 여행길잡이</span></div>
      <Container className="randomtravel">

        {error && <Error>{error}</Error>}
        {randomItem ? (
          <Row className="random-recipe-container-wrapper">
            <Col lg="6" className="my-random-img">
              <div className={`random-recipe-img ${isActive ? "fade-in" : "fade-out"}`}>
                <img src={randomItem.firstimage} alt={randomItem.title} className="random-img" />
              </div>
            </Col>
            <Col lg="6" className="my-random-dis2">
              <div className={`random-recipe-content ${isActive ? "fade-in" : "fade-out"}`}>
                <h3>{randomItem.title}</h3>
                <p>{randomItem.addr1}</p>
                <p>{randomItem.addr2}</p>
                <Button onClick={goMore} className="btn-detail" variant="primary">
                  자세히보기 &gt;
                </Button>
              </div>
            </Col>
          </Row>
        ) : (
          <p>로딩 중...</p>
        )}
      </Container>
    </div>
  );
};

export default RandomTravel;

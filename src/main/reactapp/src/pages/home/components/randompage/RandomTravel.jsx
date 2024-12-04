import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import './RandomTravel.style.css';
import { Col, Row, Button } from "react-bootstrap";
import logoimage from "../../../../logoimage.png"
import Loading from "../../../../common/Loading";

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

  const mapLink = `https://map.naver.com/p/search/${encodeURIComponent(randomItem?.addr1)}`;

  return (
    <div>
      <div className="random-title"><span className="random-title-a">'k-sketch'</span><span className="random-title-b">표 쉬운 여행길잡이</span></div>
      <div className="randomtravel">
        {error && <Error>{error}</Error>}
        {randomItem ? (
          <div className="random-recipe-container-wrapper">
            <div className="my-random-img">
              <div className={`random-recipe-img ${isActive ? "fade-in" : "fade-out"}`}>
                {/* 이미지가 있을 경우 */}
                {randomItem.firstimage ? (
                  <img
                    src={randomItem.firstimage}
                    alt={randomItem.title}
                    className="random-img"
                  />
                ) : (
                  // 이미지가 없을 경우
                  <div className="random-img no-image">

                    <div> <img src={logoimage} /></div>

                  </div>
                )}
              </div>
            </div>
            <div className="my-random-dis2">
              <div className={`random-recipe-content ${isActive ? "fade-in" : "fade-out"}`}>
                <div className="title-randompage">{randomItem.title}</div>
                <div classNmae="discrip-randompage">{randomItem.addr1}</div>
                <div classNmae="discrip-randompage">{randomItem.addr2}</div>
                <div className="dutton-random-travel">
                  <Button className="btn-detail" variant="primary" onClick={() => window.open(mapLink, "_blank")}>
                    자세히보기 &gt;
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p><Loading />.</p>
        )}
      </div>
    </div>
  );
};

export default RandomTravel;

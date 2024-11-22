import axios from "axios";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../logo3.png";
import Categories from "./Categories";
import Detail from "./Detail";
import CardDetail from "./CardDetail";

const Container = styled.div`
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Error = styled.p`
  color: #d9534f;
  text-align: center;
  font-weight: bold;
`;

const ListItem = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 200px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  overflow: hidden;
  color: #fff;
  text-align: center;
  transition: transform 0.3s ease-in-out;
  font-weight: bold;

  &:hover {
    transform: scale(1.05);
  }

  background-image: url(${(props) => props.bgImage || logo});

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
  }

  .title {
    position: relative;
    padding: 10px;
    font-size: 1.1em;
  }
`;

// 커스텀 화살표 스타일
const CustomCarousel = styled(Carousel)`
  .carousel-control-prev,
  .carousel-control-next {
    width: 5%; /* 화살표 버튼의 영역을 줄입니다 */
  }

  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    background-color: rgba(
      0,
      0,
      0,
      0.5
    ); /* 화살표 아이콘 배경을 검은색으로 설정 */
    border-radius: 50%; /* 원형으로 변경 */
    width: 30px;
    height: 30px;
  }
`;

const MenuList = () => {
  const [datas, setDatas] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modal, setModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCardDetail, setShowCardDetail] = useState(false);
  const dataCache = useMemo(() => new Map(), []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://apis.data.go.kr/B551011/KorService1/areaCode1?serviceKey=yrgC%2B43SMF1XX%2Bb2wdT%2FLStUfM%2BUtudnH1zLiN40e0zQPaLsA7YUt6A1pdgBhSOE0YFbj0Q92OgugmuP9Yjcxg%3D%3D&numOfRows=20&pageNo=1&MobileOS=ETC&MobileApp=TestApp&_type=json"
      );
      setCategories(response.data.response.body.items.item);
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error(err);
    }
  }, []);

  const fetchFilteredData = useCallback(
    async (categoryCode) => {
      // categoryCode가 null이면 전체 데이터 가져오기
      const url = categoryCode
        ? `http://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=yrgC%2B43SMF1XX%2Bb2wdT%2FLStUfM%2BUtudnH1zLiN40e0zQPaLsA7YUt6A1pdgBhSOE0YFbj0Q92OgugmuP9Yjcxg%3D%3D&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=TestApp&areaCode=${categoryCode}&_type=json`
        : `http://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=yrgC%2B43SMF1XX%2Bb2wdT%2FLStUfM%2BUtudnH1zLiN40e0zQPaLsA7YUt6A1pdgBhSOE0YFbj0Q92OgugmuP9Yjcxg%3D%3D&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=TestApp&_type=json`;

      try {
        setLoading(true);
        const response = await axios.get(url);
        const items = response.data.response.body.items.item;
        setDatas(items);
        dataCache.set(categoryCode || "all", items); // 전체 데이터는 "all" 키로 캐시
      } catch (err) {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [dataCache]
  );

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    fetchFilteredData(category.code);
  };

  const handleItemClick = (data) => {
    setSelectedData(data);
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setSelectedData(null);
  };

  useEffect(() => {
    fetchCategories();
    fetchFilteredData(selectedCategory);
  }, []);

  // 3개씩 슬라이드에 표시하기 위해 데이터 분할
  const groupedData = [];
  for (let i = 0; i < datas.length; i += 3) {
    groupedData.push(datas.slice(i, i + 3));
  }

  return (
    <Container>
      {showCardDetail ? <CardDetail data={selectedData} logo={logo} /> : null}
      <h3 style={{ textAlign: "center" }}>
        <strong style={{ color: "skyblue" }}>'국내천국'</strong>MENU
      </h3>
      <Categories
        selectedCategory={selectedCategory}
        categories={categories}
        onClick={handleCategoryClick}
      />
      {error && <Error>{error}</Error>}

      <CustomCarousel indicators={false}>
        {groupedData.map((group, index) => (
          <Carousel.Item key={index}>
            <div className="d-flex justify-content-center">
              {group.map((data, idx) => (
                <ListItem
                  key={idx}
                  onClick={() => handleItemClick(data)}
                  bgImage={data.firstimage}
                  style={{ width: "300px", margin: "0 8px" }}
                >
                  <div className="title">{data.title}</div>
                </ListItem>
              ))}
            </div>
          </Carousel.Item>
        ))}
      </CustomCarousel>

      {modal ? (
        <Detail
          setModal={setModal}
          setShowCardDetail={setShowCardDetail}
          data={selectedData}
          onClose={closeModal}
        />
      ) : null}
    </Container>
  );
};

export default MenuList;

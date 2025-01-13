import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import { useSearch } from "../../hooks/useSearch";
import { useSearchParams } from "react-router-dom";
import TravelCard from "./travelcard/TravelCard";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "./TravelList.style.css";
import Loading from "../../common/Loading";
import logoImage from "../../logoimage.png";

const TravelList = () => {
  const [query] = useSearchParams();
  const keyword = query.get("q");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // DB에서 여행 데이터 불러오기
  const fetchTravelData = async (keyword = "", areaCode = "") => {
    setIsLoading(true);
    try {
      let url = `http://localhost:8080/api/db/search`;
      
      const response = await axios.get(url);
      setData(response.data.items || []);
      setFilteredData(response.data.items || []);
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 선택된 카테고리에 따라 필터링된 데이터를 불러오는 함수
  const fetchFilteredData = async (categoryCode) => {
    try {
      const response = await axios.get(
        `http://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=yrgC%2B43SMF1XX%2Bb2wdT%2FLStUfM%2BUtudnH1zLiN40e0zQPaLsA7YUt6A1pdgBhSOE0YFbj0Q92OgugmuP9Yjcxg%3D%3D&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=TestApp&areaCode=${categoryCode}&_type=json`
      );
      setFilteredData(response.data.response.body.items.item);
    } catch (err) {
      console.error("필터링된 데이터 로딩 실패:", err);
    }
  };

  // 카테고리 선택 처리
  const handleCategoryClick = (categoryCode) => {
    setSelectedCategory(categoryCode);
    fetchTravelData(keyword, categoryCode);
  };

  // 페이지네이션 처리
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected + 1);
    fetchTravelData(keyword, selectedCategory);
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    fetchFilteredData();
    fetchTravelData(keyword);
  }, [keyword]);

  if (isLoading) {
    return <div className="bigContainer"><Loading /></div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  // 데이터가 배열인지 확인하고, 없으면 빈 배열로 처리
  const travelData = Array.isArray(data) ? data : [];
  const displayData = selectedCategory ? filteredData : travelData; // 카테고리 선택 시 필터링된 데이터 사용

  // 페이지네이션에 따른 데이터 나누기
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = displayData.slice(startIndex, endIndex); // 현재 페이지에 맞는 데이터만 가져오기

  return (
    <div>
      <Container>
        <Row>
          {/* 카테고리 버튼 */}
          <Col lg={3} md={6} xs={12}>
            {categories.map((category) => (
              <Button
                key={category.code}
                variant="primary"
                onClick={() => handleCategoryClick(category.code)}
                className="m-2"
              >
                {category.name}
              </Button>
            ))}
          </Col>

          {/* 여행 카드 리스트 */}
          <Col lg={9} xs={12}>
            <Row className="justify-content-center"> {/* Row에 수평 가운데 정렬 */}
              {paginatedData.map((totravel) => (
                <Col lg={4} md={6} xs={12} key={totravel.id} className="d-flex justify-content-center"> {/* 개별 카드에 가운데 정렬 */}
                  <TravelCard 
                    togotravel={{
                      ...totravel,
                      firstimage: totravel.firstImage || logoImage // 이미지가 없을 경우 기본 이미지 사용
                    }} 
                  />
                </Col>
              ))}
            </Row>
            <div className="page-center">
              {/* 페이지네이션 */}
              <ReactPaginate
                nextLabel="Next >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                marginPagesDisplayed={2}
                pageCount={Math.ceil(displayData.length / itemsPerPage)} // 전체 페이지 수
                previousLabel="< Previous"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakLabel="..."
                breakClassName="page-item"
                breakLinkClassName="page-link"
                containerClassName="pagination"
                activeClassName="active"
                forcePage={currentPage - 1} // 현재 페이지
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TravelList;

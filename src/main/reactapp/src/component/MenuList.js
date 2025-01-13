import axios from "axios";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { Button, Carousel, Col, Form, Row, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../logoimage.png";
import Detail from "./Detail";
import CardDetail from "./CardDetail";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import ListItem from './ListItem';

const Container = styled.div`
    font-family: Arial, sans-serif;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;

    h3 {
        @media (max-width: 768px) {
            font-size: 15px;
        }
    }

    @media (max-width: 768px) {
        font-size: 15px;
    }
`;

const Error = styled.p`
    color: #d9534f;
    text-align: center;
    font-weight: bold;
`;

////////////////////// 기능완성되면 삭제 예정

// const ListItem = styled.div`
//   position: relative;
//   display: flex;
//   align-items: flex-end;
//   justify-content: center;
//   height: 200px;
//   background-size: cover;
//   background-position: center;
//   border-radius: 8px;
//   overflow: hidden;
//   color: #fff;
//   text-align: center;
//   transition: transform 0.3s ease-in-out;
//   font-weight: bold;

//   &:hover {
//     transform: scale(1.05);
//   }

//   background-image: url(${(props) => props.bgImage || logo});

//   &::before {
//     content: "";
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     background: rgba(0, 0, 0, 0.4);
//   }

//   .title {
//     position: relative;
//     padding: 10px;
//     font-size: 1.1em;
//   }
// `;

// // 하트아이콘을 위한 스타일컴포넌트
// const HeartIcon = styled(FontAwesomeIcon)`
//   position: absolute;
//   bottom: 10px;
//   right: 10px;
//   cursor: pointer;
//   color: #fff;
//   transition: color 0.3s ease;

//   &:hover{
//     color: #ff6b6b;
//   }
// `

////////////////////// 기능완성되면 삭제 예정


// 커스텀 화살표 스타일
const CustomCarousel = styled(Carousel)`
    .carousel-control-prev,
    .carousel-control-next {
        width: 5%; /* 화살표 버튼의 영역을 줄입니다 */
    }

    .carousel-control-prev-icon,
    .carousel-control-next-icon {
        background-color: rgba(0, 0, 0, 0.5); /* 화살표 아이콘 배경을 검은색으로 설정 */
        border-radius: 50%; /* 원형으로 변경 */
        width: 30px;
        height: 30px;
    }
`;

const FilterSelect = styled.select`
    margin: 20px 0;
    padding: 10px;
    width: 100%;
    max-width: 300px;
    font-size: 1em;
`;

const StyledFormGroup = styled(Form.Group)`
    max-width: 1200px;
    margin: auto;

    .filter-row {
        display: flex;
        flex-wrap: wrap; /* 줄 바꿈 허용 */
        gap: 1rem; /* 아이템 간격 */
        align-items: center;
    }

    .filter-select {
        flex: 0 0 200px; /* 기본 너비를 200px로 제한 */
        max-width: 200px; /* 최대 너비 설정 */
        min-width: 150px; /* 최소 너비 설정 */
    }

    .filter-input {
        flex: 2; /* 검색 입력란이 더 넓게 표시 */
        min-width: 200px; /* 최소 너비 */
    }

    .filter-button {
        flex: 0 0 auto; /* 크기 고정 */
        white-space: nowrap; /* 텍스트 줄바꿈 방지 */
    }

    @media (max-width: 576px) {
        .filter-select,
        .filter-input,
        .filter-button {
            flex: 100%; /* 작은 화면에서는 전체 너비 사용 */
        }

        .filter-button {
            width: 100%; /* 버튼을 전체 가로로 설정 */
        }
    }
`;

const MenuList = () => {
    const [datas, setDatas] = useState([]);
    const [error, setError] = useState(null);
    const [localcategories, setLocalCategories] = useState([]);
    const [localSelectedCategory, setLocalSelectedCategory] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [modal, setModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCardDetail, setShowCardDetail] = useState(false);
    const dataCache = useMemo(() => new Map(), []);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filteredDatas, setFilteredDatas] = useState([]);
    const [isSearchPerformed, setIsSearchPerformed] = useState(false);

    const fetchLocalCategories = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://apis.data.go.kr/B551011/KorService1/areaCode1?serviceKey=${process.env.REACT_APP_API_KEY}&numOfRows=20&pageNo=1&MobileOS=ETC&MobileApp=TestApp&_type=json`
            );
            setLocalCategories(response.data.response.body.items.item);
        } catch (err) {
            setError("데이터를 불러오는 중 오류가 발생했습니다.");
            console.error(err);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://apis.data.go.kr/B551011/KorService1/categoryCode1?serviceKey=${process.env.REACT_APP_API_KEY}&numOfRows=20&pageNo=1&MobileOS=ETC&MobileApp=TestApp&_type=json`
            );
            setCategories(response.data.response.body.items.item);
            console.log(response.data.response.body.items.item);
        } catch (err) {
            setError("데이터를 불러오는 중 오류가 발생했습니다.");
            console.error(err);
        }
    }, []);

    const fetchFilteredData = useCallback(
        async (areaCode = null, categoryCode = null) => {
            const cacheKey = `${areaCode || "all"}-${categoryCode || "all"}`;
            const cachedData = dataCache.get(cacheKey);
            if (cachedData) {
                setDatas(cachedData);
                return;
            }

            let url = 'http://localhost:8080/api/db/search';

            try {
                setLoading(true);
                const response = await axios.get(url);
                const items = response.data.items || [];
                setDatas(items);
                dataCache.set(cacheKey, items);
            } catch (err) {
                setError("데이터를 불러오는 중 오류가 발생했습니다.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        },
        [dataCache]
    );

    const handleLocalCategoryChange = (event) => {
        const selectedCode = event.target.value;
        setLocalSelectedCategory(selectedCode);

        setIsSearchPerformed(false);
        fetchFilteredData(selectedCode, selectedCategory);

        // 검색 키워드 초기화
        setSearchKeyword("");

        // 기존 검색 결과 초기화
        setFilteredDatas([]);
    };

    const handleCategoryChange = (event) => {
        const selectedCode = event.target.value;
        setSelectedCategory(selectedCode);

        // 카테고리 필터 변경 시 기존 지역 필터도 포함
        setIsSearchPerformed(false);
        fetchFilteredData(localSelectedCategory, selectedCode);

        // 검색 키워드 초기화
        setSearchKeyword("");

        // 기존 검색 결과 초기화
        setFilteredDatas([]);
    };

    const handleSearchChange = (event) => {
        setSearchKeyword(event.target.value);
    };

    const handleSearchSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsSearchPerformed(true);
        
        const keyword = searchKeyword.trim();
        if (!keyword) {
            fetchFilteredData(localSelectedCategory, selectedCategory);
            return;
        }

        try {
            setLoading(true);
            let url = `http://localhost:8080/api/db/search?size=30&page=1&keyword=${encodeURIComponent(keyword)}`;
            if (localSelectedCategory) url += `&areacode=${localSelectedCategory}`;
            if (selectedCategory) url += `&cat1=${selectedCategory}`;

            const response = await axios.get(url);
            const items = response.data.items || [];
            setFilteredDatas(items);
        } catch (err) {
            setError("검색 중 오류가 발생했습니다.");
            console.error(err);
        } finally {
            setLoading(false);
        }
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
        fetchLocalCategories();
        fetchCategories();
        fetchFilteredData(null);
    }, [fetchLocalCategories, fetchFilteredData, fetchCategories]);

    // 3개씩 슬라이드에 표시하기 위해 데이터 분할
    const dataToDisplay = filteredDatas.length > 0 ? filteredDatas : datas;

    const groupedData = [];
    for (let i = 0; i < dataToDisplay.length; i += 9) {
        groupedData.push(dataToDisplay.slice(i, i + 9));
    }

    return (
        <Container>
            {showCardDetail ? <CardDetail data={selectedData} logo={logo} /> : null}
            <h3 style={{ textAlign: "center" }}>
                <strong style={{ color: "skyblue" }}>'국내천국'</strong>MENU
            </h3>
            {/* <Categories selectedCategory={selectedCategory} categories={categories} onClick={handleCategoryClick} />
      {error && <Error>{error}</Error>} */}

            <StyledFormGroup controlId='filterSearch' className='mb-4'>
                <div className='filter-row'>
                    {/* 지역 선택 드롭다운 */}
                    <Form.Select className='filter-select' onChange={handleLocalCategoryChange} aria-label='지역 선택'>
                        <option value=''>전체 지역</option>
                        {localcategories.map((category) => (
                            <option key={category.code} value={category.code}>
                                {category.name}
                            </option>
                        ))}
                    </Form.Select>

                    <Form.Select className='filter-select' onChange={handleCategoryChange} aria-label='카테고리'>
                        <option value=''>카테고리</option>
                        {categories.map((category) => (
                            <option key={category.code} value={category.code}>
                                {category.name}
                            </option>
                        ))}
                    </Form.Select>

                    {/* 검색 입력란 */}
                    <Form.Control
                        type='text'
                        placeholder='검색어를 입력하세요'
                        value={searchKeyword}
                        onChange={handleSearchChange}
                        className='filter-input'
                    />

                    {/* 검색 버튼 */}
                    <Button onClick={handleSearchSubmit} variant='primary' className='filter-button'>
                        검색
                    </Button>
                </div>
            </StyledFormGroup>

            {/* {loading && <Spinner animation='border' className='d-block mx-auto my-3' />} */}

            {loading ? (
                <Spinner animation='border' className='d-block mx-auto my-3' />
            ) : error ? (
                <Error>{error}</Error>
            ) : isSearchPerformed && filteredDatas.length === 0 ? ( // 검색 수행 상태일 때만 메시지 표시
                <Error>검색 결과가 없습니다.</Error>
            ) : null}

            <CustomCarousel indicators={false} interval={null}>
                {groupedData.map((group, index) => (
                    <Carousel.Item key={index}>
                        <div className='container'>
                            {Array.from({ length: 3 }).map((_, rowIndex) => (
                                <Row key={rowIndex} className='mb-3'>
                                    {group.slice(rowIndex * 3, rowIndex * 3 + 3).map((data, colIndex) => (
                                        <Col key={colIndex} xs={4} className='d-flex justify-content-center'>
                                            {/* 기능완성되면 삭제 예정 */}
                                            {/* <ListItem
                        bgImage={data.firstimage || logo}
                        onClick={() => handleItemClick(data)}
                        style={{ width: "100%", height: "150px" }}
                      >
                        <div className='title'>{data.title}</div>
                        <HeartIcon icon={faHeart} size="lg"/>
                      </ListItem> */}
                                            {/* 기능완성되면 삭제 예정 */}
                                            <ListItem
                                                data={data}
                                                logo={logo}
                                                onClick={() => handleItemClick(data)}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            ))}
                        </div>
                    </Carousel.Item>
                ))}
            </CustomCarousel>

            {
                modal ? (
                    <Detail setModal={setModal} setShowCardDetail={setShowCardDetail} data={selectedData}
                        onClose={closeModal} />
                ) : null
            }
        </Container >
    );
};

export default MenuList;

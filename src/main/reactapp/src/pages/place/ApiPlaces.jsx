import React, { useEffect, useState } from "react";
import axios from 'axios';
import ReactPaginate from 'react-paginate';

const ApiPlaces = () => {
    const [places, setPlaces] = useState([]);
    const [error, setError] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [apiType, setApiType] = useState("festival"); // 기본 API 타입
    const [keyword, setKeyword] = useState(""); // 검색어 상태
    const [contentTypeId, setContentTypeId] = useState(""); // 관광 타입 상태
    const itemsPerPage = 12; // 페이지당 아이템 수

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/${apiType}`, {
                    params: { keyword, contentTypeId }, // 검색어와 contentTypeId를 쿼리 파라미터로 전달
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                console.log(response);

                if (Array.isArray(response.data)) {
                    setPlaces(response.data);
                } else if (response.data.response && response.data.response.body && response.data.response.body.items) {
                    setPlaces(response.data.response.body.items.item);
                }
            } catch (error) {
                console.error('Error fetching place data: ', error);
                setError(error);
            }
        };

        fetchPlaces();
    }, [apiType, keyword, contentTypeId]); // apiType, keyword, contentTypeId 변경 시 데이터 재요청

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    if (!places.length) {
        return <p>Loading place data...</p>;
    }

    const pageCount = Math.ceil(places.length / itemsPerPage);

    const handlePlaceClick = (item) => {
        setSelectedPlace(item);
    };

    const closePopup = () => {
        setSelectedPlace(null);
    };

    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    const offset = currentPage * itemsPerPage;
    const currentItems = places.slice(offset, offset + itemsPerPage);

    return (
        <main className="flex-shrink-0">
            <section className="py-5">
                <div className="container">
                    <h1 className="text-center mb-4">장소 목록</h1>

                    {/* API 타입 선택 드롭다운 */}
                    <div className="mb-4">
                        <select value={apiType} onChange={(e) => setApiType(e.target.value)} className="form-select">
                            <option value="festival">축제</option>
                            <option value="stay">숙소</option>
                            <option value="common">공통 정보</option>
                            <option value="search">검색</option>
                            <option value="areaCode">지역코드</option>
                            <option value="areaList">지역리스트</option>
                        </select>
                    </div>

                    {/* 검색어 입력창 추가 */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="검색어를 입력하세요"
                            className="form-control"
                        />
                    </div>

                    {/* 관광 타입 선택 드롭다운 추가 */}
                    <div className="mb-4">
                        <select value={contentTypeId} onChange={(e) => setContentTypeId(e.target.value)} className="form-select">
                            <option value="">관광 타입 선택</option>
                            <option value="12">관광지</option>
                            <option value="14">문화시설</option>
                            <option value="15">축제공연행사</option>
                            <option value="25">여행코스</option>
                            <option value="28">레포츠</option>
                            <option value="32">숙박</option>
                            <option value="38">쇼핑</option>
                            <option value="39">음식점</option>
                        </select>
                    </div>

                    <div className="row">
                        {currentItems.map((item, index) => (
                            <div key={index} className="col-md-4 mb-4">
                                <div className="card place-item" onClick={() => handlePlaceClick(item)}>
                                    {item.firstimage ? (
                                        <img src={item.firstimage} alt={item.title} className="card-img-top place-image" style={{ height: '200px', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px', backgroundColor: '#f8f9fa' }}>
                                            <p className="text-muted">이미지가 없습니다.</p>
                                        </div>
                                    )}
                                    <div className="card-body">
                                        <h5 className="card-title">{item.title}</h5>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedPlace && (
                        <div className="modal fade show" style={{ display: 'block' }} aria-modal="true" role="dialog">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">{selectedPlace.title}</h5>
                                        <button type="button" className="btn-close" onClick={closePopup} aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        <p><strong>주소:</strong> {selectedPlace.addr1}</p>
                                        <p><strong>전화:</strong> {selectedPlace.tel}</p>
                                        <p><strong>mapx:</strong> {selectedPlace.mapx}</p>
                                        <p><strong>mapy:</strong> {selectedPlace.mapy}</p>
                                        {selectedPlace.firstimage ? (
                                            <img src={selectedPlace.firstimage} alt={selectedPlace.title} className="img-fluid" />
                                        ) : (
                                            <p className="text-muted">이미지가 없습니다.</p>
                                        )}
                                        {selectedPlace.overview ? <p><strong>overview:</strong> {selectedPlace.overview} </p> : ''}
                                    </div>
                                    {/* 데이터 저장 버튼 */}
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-primary" onClick={() => window.open(`https://map.naver.com/p/search/${encodeURIComponent(selectedPlace.addr1)}`, "_blank")}>위치</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="d-flex justify-content-center mt-4">
                        <ReactPaginate
                            previousLabel={"이전"}
                            nextLabel={"다음"}
                            breakLabel={"..."}
                            breakClassName={"break-me"}
                            pageCount={pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={handlePageClick}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                            pageClassName={"page-item"}
                            pageLinkClassName={"page-link"}
                            previousClassName={"page-item"}
                            previousLinkClassName={"page-link"}
                            nextClassName={"page-item"}
                            nextLinkClassName={"page-link"}
                            breakLinkClassName={"page-link"}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ApiPlaces;

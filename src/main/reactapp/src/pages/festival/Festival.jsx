import React, { useEffect, useState } from "react";
import axios from 'axios';

const Festival = () => {
    const [festivals, setFestivals] = useState(null); // 초기 상태를 null로 설정
    const [error, setError] = useState(null);
    const [selectedFestival, setSelectedFestival] = useState(null); // 선택된 축제 상태

    useEffect(() => {
        // axios를 사용하여 데이터 가져오기
        const fetchFestivals = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/festivals', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // 인증 헤더 추가
                    },
                });
                setFestivals(response.data); // axios에서 응답 데이터는 response.data에 있음
            } catch (error) {
                console.error('Error fetching festival data: ', error);
                setError(error);
            }
        };

        fetchFestivals(); // 데이터 가져오기 호출
    }, []);

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    // festivals가 null이거나 구조가 예상과 다를 경우를 처리
    if (!festivals || !festivals.response || !festivals.response.body || !festivals.response.body.items) {
        return <p>Loading festival data...</p>; // 데이터가 로드되지 않았을 경우 로딩 메시지 표시
    }

    const items = festivals.response.body.items.item; // items 배열을 가져옴

    const handleFestivalClick = (item) => {
        setSelectedFestival(item); // 클릭한 축제 정보를 상태에 저장
    };

    const closePopup = () => {
        setSelectedFestival(null); // 팝업 닫기
    };

    return (
        <main className="flex-shrink-0">
            <section className="py-5">
                <div className="container">
                    <h1 className="text-center mb-4">축제 목록</h1> {/* 제목 추가 */}
                    <div className="row">
                        {items.map((item, index) => (
                            <div key={index} className="col-md-4 mb-4">
                                <div className="card festival-item" onClick={() => handleFestivalClick(item)}>
                                    {item.firstimage ? (
                                        <img src={item.firstimage} alt={item.title} className="card-img-top festival-image" style={{ height: '200px', objectFit: 'cover' }} />
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

                    {selectedFestival && (
                        <div className="modal fade show" style={{ display: 'block' }} aria-modal="true" role="dialog">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">{selectedFestival.title}</h5>
                                        <button type="button" className="btn-close" onClick={closePopup} aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        <p><strong>주소:</strong> {selectedFestival.addr1}</p>
                                        <p><strong>전화:</strong> {selectedFestival.tel}</p>
                                        {selectedFestival.firstimage ? (
                                            <img src={selectedFestival.firstimage} alt={selectedFestival.title} className="img-fluid" />
                                        ) : (
                                            <p className="text-muted">이미지가 없습니다.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Festival;

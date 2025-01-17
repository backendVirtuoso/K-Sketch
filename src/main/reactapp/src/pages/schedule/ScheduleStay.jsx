import React, { useState } from 'react';
import usePlaces from '../../hooks/usePlaces';
import logoImage from '../../logoimage.png';
import './scss/ScheduleStay.scss';

// 숙박 선택 컴포넌트
const StaySelector = ({ onAddPlace, onRemovePlace, selectedPlaces: selectedStays, selectedTimes }) => {
    const [activeTab, setActiveTab] = useState('existing');
    const [apiType, setApiType] = useState("search");
    const [inputKeyword, setInputKeyword] = useState("");
    const [keyword, setKeyword] = useState("서울");
    const [showDateModal, setShowDateModal] = useState(false);
    const [selectedStay, setSelectedStay] = useState(null);

    const { places: stays, error, isLoading } = usePlaces(apiType, keyword, "32");

    const handleSearch = () => {
        setKeyword(inputKeyword);
    };

    const handleStaySelect = (stay) => {
        const stayWithMarkerType = {
            ...stay,
            markerType: 'stay'
        };
        setSelectedStay(stayWithMarkerType);
        setShowDateModal(true);
    };

    const handleDateConfirm = (stay, selectedDates) => {
        const newStay = {
            ...stay,
            selectedDates: selectedDates,
            markerType: 'stay'
        };
        onAddPlace(newStay, 'stay');
        setShowDateModal(false);
        setSelectedStay(null);
    };

    return (
        <div className="h-100 overflow-hidden">
            <div className="search-tabs">
                <button
                    className={`tab-button ${activeTab === 'existing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('existing')}
                >
                    숙소 선택
                </button>
                <button
                    className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
                    onClick={() => setActiveTab('new')}
                >
                    신규 숙소 등록
                </button>
            </div>

            {activeTab === 'existing' ? (
                <>
                    <div className="p-3 border-bottom">
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="숙소명을 입력하세요"
                                value={inputKeyword}
                                onChange={(e) => setInputKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="btn btn-primary" onClick={handleSearch}>
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-auto" style={{ height: 'calc(100% - 150px)', scrollbarWidth: 'none' }}>
                        {stays.map((stay, index) => (
                            <div key={index} className="poi-result">
                                <div className="poi-info">
                                    <div className="info-container">
                                        {stay.firstimage ? (
                                            <img
                                                src={stay.firstimage}
                                                alt={stay.title}
                                                className="place-image cover"
                                            />
                                        ) : (
                                            <img
                                                src={logoImage}
                                                alt="기본 이미지"
                                                className="place-image contain"
                                            />
                                        )}
                                        <div className="text-container">
                                            <div className="poi-title" title={stay.title}>
                                                {stay.title}
                                            </div>
                                            <div className="poi-address" title={stay.addr1}>
                                                {stay.addr1}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleStaySelect(stay)}
                                >
                                    <i className="bi bi-plus"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <StayPoiSearchTab
                    onStaySelect={handleStaySelect}
                    selectedStays={selectedStays}
                    selectedTimes={selectedTimes}
                />
            )}

            {showDateModal && selectedStay && (
                <StayDateModal
                    stay={selectedStay}
                    selectedTimes={selectedTimes}
                    reservedDates={selectedStays.reduce((dates, stay) =>
                        [...dates, ...(stay.selectedDates || [])], [])}
                    onConfirm={handleDateConfirm}
                    onClose={() => {
                        setShowDateModal(false);
                        setSelectedStay(null);
                    }}
                />
            )}
        </div>
    );
};

// 숙소 POI 검색 탭 컴포넌트
const StayPoiSearchTab = ({ onStaySelect, selectedStays }) => {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 숙소가 이미 선택되었는지 확인하는 함수
    const isStaySelected = (stay) => {
        return selectedStays.some(s =>
            s.title === stay.title &&
            s.addr1 === stay.addr1
        );
    };

    const searchPOI = async (searchKeyword) => {
        if (!searchKeyword) return;

        setIsLoading(true);
        const headers = {
            appKey: process.env.REACT_APP_TMAP_KEY
        };

        try {
            const response = await fetch(
                `https://apis.openapi.sk.com/tmap/pois?${new URLSearchParams({
                    version: 1,
                    format: 'json',
                    searchKeyword: searchKeyword,
                    resCoordType: 'WGS84GEO',
                    reqCoordType: 'WGS84GEO',
                    count: 20,
                    searchType: 'all',
                    multiPoint: 'N',
                    categoryCode: '숙박'  // 숙박 시설 카테고리로 필터링
                })}`,
                { headers }
            );
            const data = await response.json();

            if (data.searchPoiInfo?.pois?.poi) {
                const results = data.searchPoiInfo.pois.poi.map(poi => ({
                    title: poi.name,
                    addr1: `${poi.upperAddrName} ${poi.middleAddrName} ${poi.lowerAddrName}`,
                    mapx: poi.noorLon,
                    mapy: poi.noorLat,
                    firstimage: null,
                    markerType: 'stay'
                }));
                setSearchResults(results);
            }
        } catch (error) {
            console.error('POI 검색 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        searchPOI(keyword);
    };

    return (
        <div className="p-3">
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="숙소명 또는 주소를 입력하세요"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    className="btn btn-primary"
                    onClick={handleSearch}
                    disabled={isLoading}
                >
                    <i className="bi bi-search"></i>
                </button>
            </div>

            <div className="overflow-auto" style={{ height: 'calc(100% - 70px)' }}>
                {isLoading ? (
                    <div className="text-center p-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">검색중...</span>
                        </div>
                    </div>
                ) : (
                    searchResults.map((result, index) => (
                        <div key={index} className="poi-result">
                            <div className="poi-info">
                                <div className="info-container">
                                    <img
                                        src={logoImage}
                                        alt="기본 이미지"
                                        className="place-image contain"
                                    />
                                    <div className="text-container">
                                        <div className="poi-title" title={result.title}>
                                            {result.title}
                                        </div>
                                        <div className="poi-address" title={result.addr1}>
                                            {result.addr1}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                className={`btn ${isStaySelected(result) ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                                onClick={() => onStaySelect(result)}
                                disabled={isStaySelected(result)}
                            >
                                <i className={`bi ${isStaySelected(result) ? 'bi-check' : 'bi-plus'}`}></i>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// StayDateModal 컴포넌트
const StayDateModal = ({ stay, selectedTimes, reservedDates, onConfirm, onClose }) => {
    const [selectedDates, setSelectedDates] = useState([]);

    // 날짜 포맷팅 (yy.mm 형식)
    const formatDateShort = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}.${day}`;
    };

    // 날짜가 이미 예약되었는지 확인
    const isDateReserved = (date) => {
        return reservedDates.some(reservedDate =>
            reservedDate.getTime() === date.getTime()
        );
    };

    const handleDateToggle = (date) => {
        if (isDateReserved(date)) return;

        setSelectedDates(prev => {
            if (prev.includes(date)) {
                return prev.filter(d => d !== date);
            } else {
                return [...prev, date].sort((a, b) => a - b);
            }
        });
    };

    // 이미 선택된 날짜인지 확인
    const isDateSelected = (date) => {
        return selectedDates.some(selectedDate =>
            selectedDate.getTime() === date.getTime()
        );
    };

    // 전체 선택 처리 함수 추가
    const handleSelectAll = () => {
        // 예약되지 않은 날짜들만 필터링하여 전체 선택
        const availableDates = selectedTimes
            .slice(0, -1)
            .map(timeInfo => timeInfo.date)
            .filter(date => !isDateReserved(date));

        setSelectedDates(availableDates);
    };

    return (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body px-4">
                        <h5 className="text-center mb-3">숙박하실 날짜를 선택해주세요.</h5>
                        <p className="text-muted text-center small mb-4">
                            *동일한 숙소에서 연박도 남은 날짜를 선택하여 가능합니다.
                        </p>

                        <div className="text-center mb-4">
                            <h6>{stay.title}</h6>
                            <p className="text-muted small">{stay.addr1}</p>
                        </div>

                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            {selectedTimes.slice(0, -1).map((timeInfo, index) => {
                                const isReserved = isDateReserved(timeInfo.date);
                                return (
                                    <div
                                        key={index}
                                        onClick={() => !isReserved && handleDateToggle(timeInfo.date)}
                                        className={`date-select-button ${isDateSelected(timeInfo.date) ? 'selected' : ''
                                            } ${isReserved ? 'disabled' : ''}`}
                                        style={{
                                            cursor: isReserved ? 'not-allowed' : 'pointer',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: '1px solid #ddd',
                                            backgroundColor: isReserved
                                                ? '#f8f9fa'
                                                : isDateSelected(timeInfo.date)
                                                    ? '#5D2FFF'
                                                    : 'white',
                                            color: isReserved
                                                ? '#adb5bd'
                                                : isDateSelected(timeInfo.date)
                                                    ? 'white'
                                                    : 'black',
                                            minWidth: '80px',
                                            textAlign: 'center',
                                            opacity: isReserved ? 0.7 : 1
                                        }}
                                    >
                                        {formatDateShort(timeInfo.date)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="modal-footer flex-column border-0 px-4 pb-4">
                        <button
                            className="btn btn-primary w-100 py-2"
                            onClick={() => onConfirm(stay, selectedDates)}
                            disabled={selectedDates.length === 0}
                        >
                            선택 완료
                        </button>
                        <button
                            className="btn btn-outline-primary w-100 py-2 mt-2"
                            onClick={handleSelectAll}
                        >
                            전체 선택
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </div>
    );
};

// 선택된 숙박 아이템 컴포넌트
const SelectedStayItem = ({ stay, selectedTimes, selectedStays, onDateChange, onRemove }) => {
    // 날짜 포맷팅
    const formatDate = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const endDate = new Date(date);
        endDate.setDate(date.getDate() + 1);
        const endDay = endDate.getDate();

        return `${month}.${day}(${getDayOfWeek(date)})-${month}.${endDay}(${getDayOfWeek(endDate)})`;
    };

    // 요일 반환
    const getDayOfWeek = (date) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()];
    };

    // 선택된 날짜들만 표시
    const selectedDates = stay.selectedDates || [];

    return (
        <div className="selected-stays-container">
            {selectedDates.map((date, index) => (
                <div key={index} className="stay-date-item p-3 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                        <div className="stay-icon rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                            style={{ width: '24px', height: '24px', minWidth: '24px' }}>
                            {index + 1}
                        </div>
                        {stay.firstimage ? (
                            <img
                                src={stay.firstimage}
                                alt={stay.title}
                                className="stay-thumbnail"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                }}
                            />
                        ) : (
                            <img
                                src={logoImage}
                                alt="기본 이미지"
                                className="stay-thumbnail"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    objectFit: 'contain',
                                    borderRadius: '4px'
                                }}
                            />
                        )}
                        <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="text-muted small">{formatDate(date)}</div>
                            <div className="fw-bold text-truncate" title={stay.title}>{stay.title}</div>
                        </div>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onRemove(stay)}
                            style={{ padding: '4px 8px' }}
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export { StaySelector, SelectedStayItem };


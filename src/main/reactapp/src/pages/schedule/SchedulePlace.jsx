import React, { useState, useCallback } from "react";
import usePlaces from "../../hooks/usePlaces";
import logoImage from "../../logoimage.png";
import "./scss/SchedulePlace.scss";

// 장소 목록 아이템 컴포넌트
const PlaceListItem = ({ place, onAddClick, onRemoveClick, isSelected }) => (
    <div className="poi-result">
        <div className="poi-info">
            <div className="info-container">
                {place.firstimage ? (
                    <img
                        src={place.firstimage}
                        alt={place.title}
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
                    <div className="poi-title" title={place.title}>
                        {place.title}
                    </div>
                    <div className="poi-address" title={place.addr1}>
                        {place.addr1}
                    </div>
                </div>
            </div>
        </div>
        <button
            className={`btn ${isSelected ? "btn-primary" : "btn-outline-primary"
                } btn-sm`}
            onClick={() => (isSelected ? onRemoveClick(place) : onAddClick(place))}
        >
            <i className={`bi ${isSelected ? "bi-check" : "bi-plus"}`}></i>
        </button>
    </div>
);

// 장소 선택 컴포넌트
const PlaceSelector = ({
    onAddPlace,
    onRemovePlace,
    selectedPlaces,
    onClose,
    onComplete,
    isEditMode,
}) => {
    const [activeTab, setActiveTab] = useState("existing"); // 'existing' 또는 'new'
    const [apiType, setApiType] = useState("search");
    const [inputKeyword, setInputKeyword] = useState("");
    const [keyword, setKeyword] = useState("서울");
    const [contentTypeId, setContentTypeId] = useState("12");

    const CONTENT_TYPES = [
        { id: "12", text: "관광지" },
        { id: "14", text: "문화시설" },
        { id: "15", text: "축제공연" },
        { id: "28", text: "레포츠" },
        { id: "38", text: "쇼핑" },
        { id: "39", text: "음식점" },
    ];

    const { places, error, isLoading } = usePlaces(
        apiType,
        keyword,
        contentTypeId
    );

    const handleAddPlace = useCallback(
        (place) => {
            if (!selectedPlaces.some((p) => p.title === place.title)) {
                console.log('선택한 장소 좌표:', {
                    제목: place.title,
                    위도: place.mapy ? Number(parseFloat(place.mapy).toFixed(6)) : Number(parseFloat(place.latitude).toFixed(6)),
                    경도: place.mapx ? Number(parseFloat(place.mapx).toFixed(6)) : Number(parseFloat(place.longitude).toFixed(6))
                });
                onAddPlace(place);
            }
        },
        [selectedPlaces, onAddPlace]
    );

    const handleRemovePlace = (place) => {
        if (onRemovePlace && typeof onRemovePlace === 'function') {
            onRemovePlace(place);
        }
    };

    const handleSearch = () => {
        setKeyword(inputKeyword);
    };

    if (error) return <p>장소 데이터 로드 중 오류가 발생했습니다: {error.message}</p>;
    if (isLoading) return <p>장소 데이터를 로드하는 중입니다...</p>;

    return (
        <div className="place-selector-container">
            <div className="search-tabs">
                <button
                    className={`tab-button ${activeTab === 'existing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('existing')}
                >
                    장소 선택
                </button>
                <button
                    className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
                    onClick={() => setActiveTab('new')}
                >
                    신규 장소 등록
                </button>
            </div>

            {isEditMode && (
                <div className="border-top">
                    <button
                        className="btn btn-primary"
                        onClick={onComplete}
                    >
                        선택 완료
                    </button>
                    <button className="btn btn-outline-secondary" onClick={onClose}>
                        취소
                    </button>
                </div>
            )}

            {activeTab === "existing" ? (
                <>
                    <div className="p-3 border-bottom">
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="장소명을 입력하세요"
                                value={inputKeyword}
                                onChange={(e) => setInputKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <button className="btn btn-primary" onClick={handleSearch}>
                                <i className="bi bi-search"></i>
                            </button>
                        </div>

                        <div className="content-type-buttons">
                            {CONTENT_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setContentTypeId(type.id)}
                                    className={`btn btn-sm content-type-button ${contentTypeId === type.id
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                        }`}
                                >
                                    {type.text}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div
                        className="overflow-auto"
                        style={{ height: "calc(100% - 150px)", scrollbarWidth: "none" }}
                    >
                        {places.map((place, index) => (
                            <PlaceListItem
                                key={index}
                                place={place}
                                onAddClick={handleAddPlace}
                                onRemoveClick={handleRemovePlace}
                                isSelected={selectedPlaces.some((p) => p.title === place.title)}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <PoiSearchTab
                    onAddPlace={handleAddPlace}
                    selectedPlaces={selectedPlaces}
                    onRemovePlace={handleRemovePlace}
                />
            )}
        </div>
    );
};

// POI 검색 탭 컴포넌트
const PoiSearchTab = ({ onAddPlace, selectedPlaces, onRemovePlace }) => {
    const [keyword, setKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 장소가 이미 선택되었는지 확인하는 함수
    const isPlaceSelected = (place) => {
        return selectedPlaces.some(
            (p) => p.title === place.title && p.addr1 === place.addr1
        );
    };

    const searchPOI = async (searchKeyword) => {
        if (!searchKeyword) return;

        setIsLoading(true);
        const headers = {
            appKey: process.env.REACT_APP_TMAP_KEY,
        };

        try {
            const response = await fetch(
                `https://apis.openapi.sk.com/tmap/pois?${new URLSearchParams({
                    version: 1,
                    format: "json",
                    searchKeyword: searchKeyword,
                    resCoordType: "WGS84GEO",
                    reqCoordType: "WGS84GEO",
                    count: 20,
                })}`,
                { headers }
            );
            const data = await response.json();

            if (data.searchPoiInfo?.pois?.poi) {
                const results = data.searchPoiInfo.pois.poi.map((poi) => ({
                    title: poi.name,
                    addr1: `${poi.upperAddrName} ${poi.middleAddrName} ${poi.lowerAddrName}`,
                    mapx: poi.noorLon,
                    mapy: poi.noorLat,
                    firstimage: null,
                }));
                setSearchResults(results);
            }
        } catch (error) {
            console.error("POI 검색 오류:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        searchPOI(keyword);
    };

    const handlePlaceSelect = (place) => {
        if (!isPlaceSelected(place)) {
            onAddPlace(place);
        } else {
            onRemovePlace(place);
        }
    };

    return (
        <div className="p-3">
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="장소명 또는 주소를 입력하세요"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
                                className={`btn ${isPlaceSelected(result) ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                                onClick={() => handlePlaceSelect(result)}
                            >
                                <i className={`bi ${isPlaceSelected(result) ? 'bi-check' : 'bi-plus'}`}></i>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// 선택된 장소 아이템 컴포넌트
const SelectedPlaceItem = ({ place, onRemove, duration, onDurationChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [hours, setHours] = useState(Math.floor(duration / 60));
    const [minutes, setMinutes] = useState(duration % 60);
    const [tempHours, setTempHours] = useState(hours);
    const [tempMinutes, setTempMinutes] = useState(minutes);

    const handleTimeChange = (newHours, newMinutes) => {
        setTempHours(newHours);
        setTempMinutes(newMinutes);
    };

    const handleConfirm = () => {
        const totalMinutes = tempHours * 60 + tempMinutes;
        onDurationChange(place, totalMinutes);
        setHours(tempHours);
        setMinutes(tempMinutes);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempHours(hours);
        setTempMinutes(minutes);
        setIsEditing(false);
    };

    return (
        <div className="selected-item">
            <div className="d-flex align-items-center gap-3">
                <img
                    src={place.firstimage || logoImage}
                    alt={place.firstimage ? place.title : "기본 이미지"}
                    className="selected-item-image"
                />
                <div className="selected-item-content">
                    <div className="fw-bold text-truncate" title={place.title}>
                        {place.title}
                    </div>
                    <small
                        className="text-muted text-truncate d-block"
                        title={place.addr1 || "주소 정보가 없습니다"}
                    >
                        {place.addr1 || "주소 정보가 없습니다"}
                    </small>
                </div>
                <div className="duration-controls">
                {isEditing ? (
                    <div className="d-flex align-items-center">
                        <div className="d-flex align-items-center"
                            style={{
                                padding: '6px 10px',
                                background: '#fff',
                                fontSize: '0.875rem'
                            }}>
                            <input
                                type="number"
                                value={tempHours}
                                onChange={(e) => handleTimeChange(parseInt(e.target.value) || 0, tempMinutes)}
                                style={{
                                    width: '32px',
                                    border: 'none',
                                    textAlign: 'right',
                                    padding: '0 2px',
                                    fontWeight: 'bold'
                                }}
                            />
                            <span style={{ margin: '0 2px' }}>시간</span>
                            <input
                                type="number"
                                value={tempMinutes}
                                onChange={(e) => handleTimeChange(tempHours, parseInt(e.target.value) || 0)}
                                style={{
                                    width: '32px',
                                    border: 'none',
                                    textAlign: 'right',
                                    padding: '0 2px',
                                    fontWeight: 'bold'
                                }}
                            />
                            <span style={{ marginRight: '6px' }}>분</span>
                            <button
                                className="btn btn-link p-0 text-primary"
                                onClick={handleConfirm}
                                style={{
                                    textDecoration: 'none',
                                    fontSize: '0.875rem'
                                }}
                            >
                                완료
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <button
                            className="btn btn-sm btn-outline-secondary duration-button"
                            onClick={() => setIsEditing(true)}
                        >
                            {hours}시간 {minutes > 0 ? `${minutes}분` : ""}
                        </button>
                        <button
                            className="btn btn-sm btn-outline-danger flex-shrink-0"
                            onClick={() => onRemove(place)}
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    </>
                )}
                </div>
            </div>
        </div>
    );
};

export { SelectedPlaceItem, PlaceSelector };
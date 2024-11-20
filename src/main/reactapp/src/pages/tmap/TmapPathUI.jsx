import React, {useState, useCallback, useEffect} from 'react';
import axios from "axios";

const usePlaces = (apiType = 'search', keyword, contentTypeId) => {
    const [places, setPlaces] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`http://localhost:8080/api/${apiType}`, {
                    params: { keyword, contentTypeId },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (Array.isArray(response.data)) {
                    setPlaces(response.data);
                } else if (response.data.response?.body?.items) {
                    setPlaces(response.data.response.body.items.item);
                }
            } catch (error) {
                console.error('Error fetching place data: ', error);
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaces();
    }, [apiType, keyword, contentTypeId]);

    return { places, error, isLoading };
};

const PlaceListItem = ({ place, onAddClick, onRemoveClick, isSelected }) => {
    return (
        <div className="d-flex align-items-center p-2 border-bottom hover:bg-gray-50">
            <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-3">
                    {place.firstimage ? (
                        <img
                            src={place.firstimage}
                            alt={place.title}
                            className="rounded"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                    ) : (
                        <div className="d-flex justify-content-center align-items-center bg-light h-100 rounded-start">
                            <small className="text-muted m-0">이미지가<br/>없습니다</small>
                        </div>
                    )}
                    <div>
                        <div className="fw-bold">{place.title}</div>
                        <small className="text-muted">{place.addr1}</small>
                    </div>
                </div>
            </div>
            <button
                className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                onClick={isSelected ? () => onRemoveClick(place) : () => onAddClick(place)}
            >
                <i className={`bi ${isSelected ? 'bi-check' : 'bi-plus'}`}></i>
            </button>
        </div>
    );
};

const PlaceSelector = ({ onAddPlace, selectedPlaces, setSelectedPlaces }) => {
    const [apiType, setApiType] = useState("search");
    const [inputKeyword, setInputKeyword] = useState("부산");
    const [keyword, setKeyword] = useState("부산");
    const [contentTypeId, setContentTypeId] = useState("15");
    const { places, error, isLoading } = usePlaces(apiType, keyword, contentTypeId);

    const handleAddPlace = useCallback((place) => {
        if (!selectedPlaces.includes(place)) {
            setSelectedPlaces(prevSelectedPlaces => [...prevSelectedPlaces, place]);
            onAddPlace(place);
        }
    }, [selectedPlaces, onAddPlace]);

    const handleRemovePlace = useCallback((placeToRemove) => {
        setSelectedPlaces(selectedPlaces.filter(place => place !== placeToRemove));
    }, [selectedPlaces]);

    const handleSearch = () => {
        setKeyword(inputKeyword);
    };

    const handleApiTypeChange = useCallback((e) => {
        setApiType(e.target.value);
        setKeyword(inputKeyword);
    }, [inputKeyword]);

    const handleContentTypeChange = useCallback((e) => {
        setContentTypeId(e.target.value);
        setKeyword(inputKeyword);
    }, [inputKeyword]);

    if (error) return <p>장소 데이터 로드 중 오류가 발생했습니다: {error.message}</p>;
    if (isLoading) return <p>장소 데이터를 로드하는 중입니다...</p>;

    return (
        <div className="h-100 overflow-hidden">
            <div className="p-3 border-bottom">
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="장소명을 입력하세요"
                        value={inputKeyword}
                        onChange={(e) => setInputKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn btn-primary" onClick={handleSearch}>
                        <i className="bi bi-search"></i>
                    </button>
                </div>

                <div className="mb-4">
                    <select value={apiType} onChange={handleApiTypeChange} className="form-select">
                        <option value="festival">축제</option>
                        <option value="stay">숙소</option>
                        <option value="common">공통 정보</option>
                        <option value="search">검색</option>
                    </select>
                </div>

                <div className="mb-4">
                    <select value={contentTypeId} onChange={handleContentTypeChange} className="form-select">
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
            </div>

            <div className="overflow-auto" style={{ height: 'calc(100% - 116px)', scrollbarWidth: 'none' }}>
                {places.map((place, index) => (
                    <PlaceListItem
                        key={index}
                        place={place}
                        onAddClick={handleAddPlace}
                        onRemoveClick={handleRemovePlace}
                        isSelected={selectedPlaces.includes(place)}
                    />
                ))}
            </div>
        </div>
    );
};

const SelectedPlacesPanel = ({ selectedPlaces, onRemovePlace }) => {
    return (
        <div
            style={{
                width: '430px',
                maxHeight: '100%',
                backgroundColor: 'white',
                borderRight: '1px solid #dee2e6',
                padding: '10px',
                overflowY: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                zIndex: 1000,
                scrollbarWidth: 'none'
            }}
        >
            <div className="p-3 border-bottom">
                <h6 className="m-0">선택한 장소 목록</h6>
            </div>
            <div className="overflow-auto h-100 p-3" style={{ scrollbarWidth: 'none' }}>
                {selectedPlaces.map((place, index) => (
                    <div key={index} className="d-flex align-items-center gap-3">
                        <img
                            src={place.firstimage}
                            alt={place.title}
                            className="rounded"
                            style={{width: '50px', height: '50px', objectFit: 'cover'}}
                        />
                        <div className="flex-grow-1">
                            <div className="fw-bold">{place.title}</div>
                            <small className="text-muted">{place.addr1 || '주소 정보가 없습니다'}</small>
                        </div>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onRemovePlace(place)}
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TmapPathUI = ({ mapRef, keyword, setKeyword, searchType, setSearchType, pathType, setPathType, handleSearch, searchRoute, results, handleSelectLocation, startPoint, endPoint, viaPoints, routeResult, transitDetails, }) => {
    const [currentStep, setCurrentStep] = useState('path');
    const [selectedPlaces, setSelectedPlaces] = useState([]);

    const handleAddPlace = (place) => {
        setSelectedPlaces([...selectedPlaces, place]);
    };

    const handleRemovePlace = (placeToRemove) => {
        setSelectedPlaces(selectedPlaces.filter(place => place !== placeToRemove));
    };

    return (
        <div style={{ display: 'flex', width: '100vw', height: '90vh' }}>
            <div className="flex-column p-3" style={{ width: '100px' }}>
                <button
                    onClick={() => setCurrentStep('path')}
                    className={`btn btn-link ${currentStep === 'path' ? 'text-primary fw-bold' : ''}`}
                >
                    STEP 1: 길찾기
                </button>
                <button
                    onClick={() => setCurrentStep('place')}
                    className={`btn btn-link ${currentStep === 'place' ? 'text-primary fw-bold' : ''}`}
                >
                    STEP 2: 장소 선택
                </button>
            </div>

            <div className="d-flex flex-grow-1">
                <div
                    style={{
                        width: '430px',
                        maxHeight: '100%',
                        backgroundColor: 'white',
                        borderRight: '1px solid #dee2e6',
                        padding: '10px',
                        overflowY: 'auto',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                    }}
                >
                    {currentStep === 'path' ? (
                        <>
                            {/* 길찾기 화면 */}
                            <div className="btn-group w-100 mb-2">
                                <button
                                    onClick={() => setSearchType('start')}
                                    className={`btn btn-sm ${searchType === 'start' ? 'btn-primary' : 'btn-outline-primary'}`}
                                >
                                    <i className="bi bi-geo-alt-fill me-1"></i>출발
                                </button>
                                <button
                                    onClick={() => setSearchType('via')}
                                    className={`btn btn-sm ${searchType === 'via' ? 'btn-primary' : 'btn-outline-primary'}`}
                                >
                                    <i className="bi bi-geo-alt me-1"></i>경유지
                                </button>
                                <button
                                    onClick={() => setSearchType('end')}
                                    className={`btn btn-sm ${searchType === 'end' ? 'btn-primary' : 'btn-outline-primary'}`}
                                >
                                    <i className="bi bi-geo-alt me-1"></i>도착
                                </button>
                            </div>

                            <div className="input-group input-group-sm mb-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="주소 또는 장소 검색"
                                />
                                <button className="btn btn-primary" onClick={handleSearch}>
                                    <i className="bi bi-search"></i>
                                </button>
                            </div>

                            <div className="d-flex gap-1">
                                <select
                                    className="form-select form-select-sm"
                                    value={pathType}
                                    onChange={(e) => setPathType(e.target.value)}
                                >
                                    <option value="pedestrian">보행자</option>
                                    <option value="car">자동차</option>
                                    <option value="transit">대중교통</option>
                                </select>
                                <button className="btn btn-primary btn-sm" onClick={searchRoute}>
                                    <i className="bi bi-signpost-2"></i>
                                </button>
                            </div>

                            <div className="bg-light p-2 rounded mt-2">
                                <div className="small mb-2">
                                    <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                                    <span className="fw-bold">출발:</span>
                                    <div className="text-truncate">{startPoint?.name || '선택되지 않음'}</div>
                                </div>
                                <div className="small mb-2">
                                    <i className="bi bi-geo-alt text-primary me-1"></i>
                                    <span className="fw-bold">경유지:</span>
                                    <div className="text-truncate">
                                        {viaPoints.length > 0 ? viaPoints.map(v => v.name).join(', ') : '선택되지 않음'}
                                    </div>
                                </div>
                                <div className="small">
                                    <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                                    <span className="fw-bold">도착:</span>
                                    <div className="text-truncate">{endPoint?.name || '선택되지 않음'}</div>
                                </div>
                            </div>

                            {routeResult && (
                                <div className="alert alert-info mt-2 py-1 small mb-0">
                                    <i className="bi bi-info-circle me-1"></i>{routeResult}
                                </div>
                            )}

                            {results.length > 0 && (
                                <div className="list-group list-group-flush mt-2">
                                    {results.map((result, index) => (
                                        <button
                                            key={index}
                                            className="list-group-item list-group-item-action py-2"
                                            onClick={() => handleSelectLocation(result)}
                                            style={{borderRadius: '5px', marginBottom: '5px'}}
                                        >
                                            <div className="fw-bold">{result.name}</div>
                                            {result.type === 'poi' && (
                                                <small className="text-muted d-block">{result.address}</small>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {transitDetails && pathType === 'transit' && (
                                <div className="border-top p-3" style={{maxHeight: '40vh', overflowY: 'auto'}}>
                                    <h6 className="mb-2">경로 상세 정보</h6>
                                    <div>
                                        {transitDetails.map((detail, index) => (
                                            <div key={index} className="transit-step mb-2">
                                                {detail.mode === 'WALK' ? (
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-person-walking me-2"></i>
                                                        <div>
                                                            <div>도보 {detail.sectionTime}분</div>
                                                            <small className="text-muted">
                                                                {detail.start} → {detail.end} ({detail.distance}km)
                                                            </small>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex align-items-center">
                                                        <i className={`bi ${detail.mode === 'BUS' ? 'bi-bus-front' : 'bi-train-front'} me-2`}></i>
                                                        <div>
                                                            <div>{detail.routeName || detail.routeNumber}</div>
                                                            <small className="text-muted">
                                                                {detail.start} → {detail.end} ({detail.sectionTime}분)
                                                            </small>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <PlaceSelector
                            onAddPlace={handleAddPlace}
                            selectedPlaces={selectedPlaces}
                            setSelectedPlaces={setSelectedPlaces}
                        />
                    )}
                </div>

                {selectedPlaces.length > 0 && (
                    <SelectedPlacesPanel
                        selectedPlaces={selectedPlaces}
                        onRemovePlace={handleRemovePlace}
                    />
                )}

                <div
                    id="map_div"
                    ref={mapRef}
                    style={{
                        flexGrow: 1,
                        height: '100%',
                        position: 'relative',
                    }}
                />
            </div>
        </div>
    );
};

export default TmapPathUI;

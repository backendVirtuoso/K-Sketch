import React, {useState, useCallback, useEffect} from 'react';
import axios from "axios";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ko from 'date-fns/locale/ko';

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

const PlaceSelector = ({ onAddPlace, onRemovePlace, selectedPlaces, setSelectedPlaces }) => {
    const [apiType, setApiType] = useState("search");
    const [inputKeyword, setInputKeyword] = useState("부산");
    const [keyword, setKeyword] = useState("부산");
    const [contentTypeId, setContentTypeId] = useState("15");
    const { places, error, isLoading } = usePlaces(apiType, keyword, contentTypeId);

    const handleAddPlace = useCallback((place) => {
        if (!selectedPlaces.some(p => p.title === place.title)) {
            onAddPlace(place);
        }
    }, [selectedPlaces, onAddPlace]);

    const handleRemovePlace = useCallback((place) => {
        onRemovePlace(place);
    }, [onRemovePlace]);

    const handleSearch = () => {
        setKeyword(inputKeyword);
    };

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

                <div className="mb-3">
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
                        isSelected={selectedPlaces.some(p => p.title === place.title)}
                    />
                ))}
            </div>
        </div>
    );
};

const DateSelector = () => {
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [showTimeSelector, setShowTimeSelector] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);

    const handleDateChange = (update) => {
        const [start, end] = update;
        if (start && end) {
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (diffDays > 10) {
                alert('최대 10일까지만 선택 가능합니다.');
                return;
            }
        }
        setDateRange(update);
    };

    const handleConfirmDates = () => {
        if (startDate && endDate) {
            const dates = [];
            let currentDate = new Date(startDate);
            
            while (currentDate <= endDate) {
                dates.push({
                    date: new Date(currentDate),
                    startTime: "10:00",
                    endTime: "22:00"
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            setSelectedDates(dates);
            setShowTimeSelector(true);
        }
    };

    const calculateTotalHours = (startTime, endTime) => {
        const [startHour] = startTime.split(':').map(Number);
        const [endHour] = endTime.split(':').map(Number);
        
        let hours = endHour - startHour;
        if (hours < 0) {
            hours += 24;
        }
        return hours;
    };

    const handleTimeChange = (index, type, value) => {
        const updatedDates = [...selectedDates];
        updatedDates[index] = {
            ...updatedDates[index],
            [type]: value
        };
        
        // 시작 시간이 종료 시간보다 늦은 경우 종료 시간을 자동으로 조정
        if (type === 'startTime') {
            const startHour = parseInt(value.split(':')[0]);
            const endHour = parseInt(updatedDates[index].endTime.split(':')[0]);
            
            if (startHour >= endHour) {
                updatedDates[index].endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;
            }
        }
        // 종료 시간이 시작 시간보다 이른 경우 시작 시간을 자동으로 조정
        else if (type === 'endTime') {
            const startHour = parseInt(updatedDates[index].startTime.split(':')[0]);
            const endHour = parseInt(value.split(':')[0]);
            
            if (endHour <= startHour) {
                updatedDates[index].startTime = `${(endHour - 1).toString().padStart(2, '0')}:00`;
            }
        }
        
        setSelectedDates(updatedDates);
    };

    return (
        <div className="h-100 overflow-hidden">
            {!showTimeSelector ? (
                <div className="p-4">
                    <h5 className="mb-3">언제가세요?</h5>
                    <p className="text-primary small mb-4">
                        <i className="bi bi-info-circle me-2"></i>
                        현재 10일까지 선택 가능
                    </p>

                    <div className="react-datepicker__tab-loop">
                        <div className="react-datepicker__tab-loop__start" tabIndex="0"></div>
                        <div className="react-datepicker-popper" data-placement="bottom">
                            <DatePicker
                                selected={startDate}
                                onChange={handleDateChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                                monthsShown={1}
                                locale={ko}
                                dateFormat="yyyy년 MM월 dd일"
                                minDate={new Date()}
                                className="form-control"
                                calendarClassName="border-0"
                                wrapperClassName="w-100"
                            />
                        </div>
                    </div>

                    {startDate && endDate && (
                        <div className="mt-4">
                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <small className="text-muted d-block">가는날</small>
                                    <span className="text-primary fw-bold">
                                        {startDate.toLocaleDateString('ko-KR', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            weekday: 'short'
                                        })}
                                    </span>
                                </div>
                                <div>
                                    <small className="text-muted d-block">오는날</small>
                                    <span className="text-primary fw-bold">
                                        {endDate.toLocaleDateString('ko-KR', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            weekday: 'short'
                                        })}
                                    </span>
                                </div>
                                <div className="text-primary fw-bold">
                                    {Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))}박 
                                    {Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24) + 1)}일
                                </div>
                            </div>
                            <button 
                                className="btn btn-primary w-100"
                                onClick={handleConfirmDates}
                            >
                                시간 설정하기
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-4">
                    <h5 className="mb-4">여행 시간 설정</h5>
                    <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                        {selectedDates.map((dateInfo, index) => (
                            <div key={index} className="mb-4 pb-3 border-bottom">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="fw-bold">
                                        {dateInfo.date.toLocaleDateString('ko-KR', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            weekday: 'short'
                                        })}
                                    </div>
                                    <div className="text-muted small">
                                        총 {calculateTotalHours(dateInfo.startTime, dateInfo.endTime)}시간
                                    </div>
                                </div>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <label className="form-label small text-muted">시작 시간</label>
                                        <select 
                                            className="form-select"
                                            value={dateInfo.startTime}
                                            onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                                        >
                                            {Array.from({length: 24}, (_, i) => {
                                                const timeValue = `${String(i).padStart(2, '0')}:00`;
                                                const endHour = parseInt(dateInfo.endTime);
                                                // 종료 시간보다 같거나 큰 시간은 제외
                                                if (i >= endHour) return null;
                                                return (
                                                    <option key={i} value={timeValue}>
                                                        {timeValue}
                                                    </option>
                                                );
                                            }).filter(Boolean)}
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small text-muted">종료 시간</label>
                                        <select 
                                            className="form-select"
                                            value={dateInfo.endTime}
                                            onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                                        >
                                            {Array.from({length: 24}, (_, i) => {
                                                const timeValue = `${String(i).padStart(2, '0')}:00`;
                                                const startHour = parseInt(dateInfo.startTime);
                                                // 시작 시간보다 같거나 작은 시간은 제외
                                                if (i <= startHour) return null;
                                                return (
                                                    <option key={i} value={timeValue}>
                                                        {timeValue}
                                                    </option>
                                                );
                                            }).filter(Boolean)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3">
                        <button 
                            className="btn btn-outline-primary me-2"
                            onClick={() => setShowTimeSelector(false)}
                        >
                            이전으로
                        </button>
                        <button className="btn btn-primary">
                            시간 설정 완료
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const TmapPathUI = ({
    mapRef, 
    keyword, 
    setKeyword, 
    searchType, 
    setSearchType, 
    pathType, 
    setPathType, 
    handleSearch, 
    searchRoute, 
    results, 
    handleSelectLocation, 
    startPoint, 
    endPoint, 
    viaPoints, 
    routeResult, 
    transitDetails,
    handleAddPlace: parentHandleAddPlace,
    handleRemovePlace: parentHandleRemovePlace
}) => {
    const [currentStep, setCurrentStep] = useState('path');
    const [selectedPlaces, setSelectedPlaces] = useState([]);

    const handleAddPlace = (place) => {
        if (!selectedPlaces.some(p => p.title === place.title)) {
            setSelectedPlaces(prev => [...prev, place]);
            parentHandleAddPlace(place);
        }
    };

    const handleRemovePlace = (placeToRemove) => {
        setSelectedPlaces(prev => prev.filter(place => place.title !== placeToRemove.title));
        parentHandleRemovePlace(placeToRemove);
    };

    const placeSelectorProps = {
        onAddPlace: handleAddPlace,
        onRemovePlace: handleRemovePlace,
        selectedPlaces,
        setSelectedPlaces
    };

    return (
        <div style={{ display: 'flex', width: '100vw', height: '88vh' }}>
            <div className="flex-column p-3" style={{ width: '100px' }}>
                <div className="d-flex flex-column gap-2">
                    <button
                        onClick={() => setCurrentStep('path')}
                        className={`btn border-0 p-3 rounded-3 ${
                            currentStep === 'path' 
                            ? 'text-primary fw-bold bg-primary bg-opacity-10' 
                            : 'text-secondary bg-light'
                        }`}
                        style={{ 
                            transition: 'all 0.3s ease',
                            opacity: currentStep === 'path' ? 1 : 0.5,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%'
                        }}
                    >
                        <div className="small text-center" style={{ fontSize: '12px' }}>STEP 0<br/>길찾기 경로</div>
                    </button>
                    
                    <button
                        onClick={() => setCurrentStep('date')}
                        className={`btn border-0 p-3 rounded-3 ${
                            currentStep === 'date' 
                            ? 'text-primary fw-bold bg-primary bg-opacity-10' 
                            : 'text-secondary bg-light'
                        }`}
                        style={{ 
                            transition: 'all 0.3s ease',
                            opacity: currentStep === 'date' ? 1 : 0.5,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%'
                        }}
                    >
                        <div className="small text-center" style={{ fontSize: '12px' }}>STEP 1<br/>날짜 선택</div>
                        </button>
                    
                    <button
                        onClick={() => setCurrentStep('place')}
                        className={`btn border-0 p-3 rounded-3 ${
                            currentStep === 'place' 
                            ? 'text-primary fw-bold bg-primary bg-opacity-10' 
                            : 'text-secondary bg-light'
                        }`}
                        style={{ 
                            transition: 'all 0.3s ease',
                            opacity: currentStep === 'place' ? 1 : 0.5,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%'
                        }}
                    >
                        <div className="small text-center" style={{ fontSize: '12px' }}>STEP 2<br/>장소 선택</div>
                    </button>
                </div>
            </div>

            <div className="d-flex flex-grow-1" style={{ position: 'relative' }}>
                <div
                    style={{
                        width: '400px',
                        maxHeight: '100%',
                        backgroundColor: 'white',
                        borderRight: '1px solid #dee2e6',
                        padding: '10px',
                        overflowY: 'auto',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        flexShrink: 0,
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
                                <div className="border-top p-3" style={{maxHeight: '60vh', overflowY: 'auto'}}>
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
                    ) : currentStep === 'date' ? (
                        <DateSelector />
                    ) : (
                        <PlaceSelector {...placeSelectorProps} />
                    )}
                </div>

                {/* 선택된 장소 패널 */}
                {selectedPlaces.length > 0 && (
                    <div style={{
                            position: 'absolute',
                            left: '400px',
                            top: 0,
                            bottom: 0,
                            width: '400px',
                            backgroundColor: 'white',
                            borderRight: '1px solid #dee2e6',
                            padding: '10px',
                            overflowY: 'auto',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                        }} >
                        <div className="p-3 border-bottom">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="m-0">선택한 장소 목록</h6>
                                <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                        setSelectedPlaces([]);
                                        selectedPlaces.forEach(place => parentHandleRemovePlace(place));
                                    }}
                                >
                                    전체 초기화
                                </button>
                            </div>
                        </div>
                        <div className="overflow-auto h-100 p-3" style={{ scrollbarWidth: 'none' }}>
                            {selectedPlaces.map((place, index) => (
                                <div key={index} className="d-flex align-items-center gap-3" style={{ marginBottom: '10px' }}>
                                    <img
                                        src={place.firstimage}
                                        alt={place.title}
                                        className="rounded"
                                        style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                    />
                                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                        <div className="fw-bold text-truncate">{place.title}</div>
                                        <small className="text-muted text-truncate d-block">{place.addr1 || '주소 정보가 없습니다'}</small>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline-danger flex-shrink-0"
                                        onClick={() => {
                                            handleRemovePlace(place);
                                            parentHandleRemovePlace(place);
                                        }}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 지도 영역 */}
                <div id="map_div" ref={mapRef} style={{
                    flexGrow: 1,
                    height: '100%',
                    position: 'relative',
                }}/>
            </div>
        </div>
    );
};

export default TmapPathUI;

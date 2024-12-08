import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './ScheduleUI.style.css';
import { SelectedPlaceItem, PlaceSelector, StaySelector, DateSelector, StepButton, STEP_BUTTONS, SelectedStayItem } from './SchedulePlace';

// 메인 UI 컴포넌트
const ScheduleUI = ({
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
    startPoint, endPoint, viaPoints,
    routeResult,
    transitDetails,
    routeDetails,
    handleAddPlace: parentHandleAddPlace,
    handleRemovePlace: parentHandleRemovePlace
}) => {
    const [currentStep, setCurrentStep] = useState('date');
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [selectedStays, setSelectedStays] = useState([]);
    const [placeDurations, setPlaceDurations] = useState({});
    const [selectedDateRange, setSelectedDateRange] = useState(null);
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [isDateSelectionComplete, setIsDateSelectionComplete] = useState(false);
    const [showPathModal, setShowPathModal] = useState(false);

    const handleAddPlace = (place) => {
        if (!selectedPlaces.some(p => p.title === place.title)) {
            setSelectedPlaces(prev => [...prev, place]);
            setPlaceDurations(prev => ({
                ...prev,
                [place.title]: 120 // 기본 2시간 (120분)
            }));
            parentHandleAddPlace(place);
        }
    };

    const handleRemovePlace = (placeToRemove) => {
        setSelectedPlaces(prev => prev.filter(place => place.title !== placeToRemove.title));
        parentHandleRemovePlace(placeToRemove);
    };

    const handleAddStay = (stay) => {
        if (!selectedStays.some(s => s.title === stay.title)) {
            setSelectedStays(prev => [...prev, stay]);
            parentHandleAddPlace(stay); // 숙박 시설도 경유지로 추가
        }
    };

    const handleRemoveStay = (stayToRemove) => {
        setSelectedStays(prev => prev.filter(stay => stay.title !== stayToRemove.title));
        parentHandleRemovePlace(stayToRemove);
    };

    const handleDurationChange = (place, duration) => {
        setPlaceDurations(prev => ({
            ...prev,
            [place.title]: duration
        }));
    };

    // 총 소요 시간 계산
    const totalDuration = Object.values(placeDurations).reduce((sum, duration) => sum + duration, 0);
    const totalHours = Math.floor(totalDuration / 60);
    const totalMinutes = totalDuration % 60;

    // 일자별 총 가용 시간 계산 (분 단위)
    const calculateTotalAvailableTime = () => {
        if (!selectedTimes || selectedTimes.length === 0) return 0;

        return selectedTimes.reduce((total, dateInfo) => {
            const startHour = parseInt(dateInfo.startTime.split(':')[0]);
            const endHour = parseInt(dateInfo.endTime.split(':')[0]);
            const duration = (endHour - startHour) * 60; // 분 단위로 변환
            return total + duration;
        }, 0);
    };

    // 총 가용 시간을 시간:분 형식으로 변환
    const formatTotalTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}시간${mins > 0 ? ` ${mins}분` : ''}`;
    };

    const totalAvailableTime = calculateTotalAvailableTime();

    const placeSelectorProps = {
        onAddPlace: handleAddPlace,
        onRemovePlace: handleRemovePlace,
        selectedPlaces
    };

    const staySelectorProps = {
        onAddPlace: handleAddStay,
        onRemovePlace: handleRemoveStay,
        selectedPlaces: selectedStays,
        selectedTimes: selectedTimes
    };

    const renderDateInfo = () => {
        if (!selectedDateRange) return null;

        return (
            <div className="selected-date-info mb-3">
                <small className="text-muted d-block">여행 일정</small>
                <div className="fw-bold">
                    {selectedDateRange[0].toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        weekday: 'short'
                    })}
                    {" - "}
                    {selectedDateRange[1].toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        weekday: 'short'
                    })}
                </div>
            </div>
        );
    };

    // 경로 타입 선택 핸들러
    const handlePathSelect = (type) => {
        setPathType(type);
        setShowPathModal(false);
        searchRoute();
    };

    return (
        <div className="tmap-container">
            
            {/* 사이드바 */}
            <div className="sidebar">
                <div className="d-flex flex-column gap-2">
                    {STEP_BUTTONS.map(({ id, step, text }) => (
                        <StepButton
                            key={id}
                            id={id}
                            step={step}
                            text={text}
                            currentStep={currentStep}
                            onClick={setCurrentStep}
                        />
                    ))}

                    <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => setShowPathModal(true)}
                    >
                        <i className="bi bi-signpost-2"></i> 경로검색
                    </button>
                </div>
            </div>

            {/* 경로 선택 모달 추가 */}
            {showPathModal && (
                <div className="modal-overlay" onClick={() => setShowPathModal(false)}>
                    <div className="path-modal" onClick={e => e.stopPropagation()}>
                        <h5 className="text-center mb-4">이동수단 선택</h5>
                        <p className="text-center text-muted small mb-4">
                            여행 시 이용하실 이동수단을 선택해주세요.
                        </p>
                        <div className="d-flex justify-content-center gap-3">
                            <button 
                                className="path-option-btn"
                                onClick={() => handlePathSelect('transit')}
                            >
                                <div className="icon-wrapper mb-2">
                                    <i className="bi bi-bus-front fs-2"></i>
                                </div>
                                <span>대중교통</span>
                            </button>
                            <button 
                                className="path-option-btn"
                                onClick={() => handlePathSelect('car')}
                            >
                                <div className="icon-wrapper mb-2">
                                    <i className="bi bi-car-front fs-2"></i>
                                </div>
                                <span>승용차</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 메인 컨텐츠 */}
            <div className="main-content">
                <div className="left-panel">
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
                                            style={{ borderRadius: '5px', marginBottom: '5px' }}
                                        >
                                            <div className="fw-bold">{result.name}</div>
                                            {result.type === 'poi' && (
                                                <small className="text-muted d-block">{result.address}</small>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* 경로 상세 정보 표시 */}
                            {(transitDetails || routeDetails) && (
                                <div className="route-details-container">
                                    <h6 className="mb-2">경로 상세 정보</h6>
                                    <div>
                                        {pathType === 'transit' && transitDetails ? (
                                            // 대중교통 경로 상세 정보
                                            transitDetails.map((detail, index) => (
                                                <div key={index} className="route-step">
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
                                            ))
                                        ) : (
                                            // 보행자/자동차 경로 상세 정보
                                            routeDetails?.features?.map((feature, index) => {
                                                if (feature.properties.turnType !== undefined) {
                                                    let icon, description;
                                                    const distance = (feature.properties.distance || 0).toFixed(1);

                                                    // 보행자 경로 턴타입 처리
                                                    if (pathType === 'pedestrian') {
                                                        switch (feature.properties.turnType) {
                                                            case 211: description = "계단을 이용"; icon = "bi-stairs"; break;
                                                            case 212: description = "지하도를 이용"; icon = "bi-arrow-down-circle"; break;
                                                            case 213: description = "육교를 이용"; icon = "bi-arrow-up-circle"; break;
                                                            case 214: description = "도보 이동"; icon = "bi-person-walking"; break;
                                                            case 215: description = "광장을 통해 이동"; icon = "bi-square"; break;
                                                            case 11: description = "직진"; icon = "bi-arrow-up"; break;
                                                            case 12: description = "좌회전"; icon = "bi-arrow-left"; break;
                                                            case 13: description = "우회전"; icon = "bi-arrow-right"; break;
                                                            case 14: description = "유턴"; icon = "bi-arrow-return-left"; break;
                                                            default: description = "직진"; icon = "bi-arrow-up";
                                                        }
                                                    }
                                                    // 자동차 경로 턴타�� 처리
                                                    else {
                                                        switch (feature.properties.turnType) {
                                                            case 11: description = "직진"; icon = "bi-arrow-up"; break;
                                                            case 12: description = "좌회전"; icon = "bi-arrow-left"; break;
                                                            case 13: description = "우회전"; icon = "bi-arrow-right"; break;
                                                            case 14: description = "유턴"; icon = "bi-arrow-return-left"; break;
                                                            case 16: description = "8시 방향"; icon = "bi-arrow-left"; break;
                                                            case 17: description = "10시 방향"; icon = "bi-arrow-left"; break;
                                                            case 18: description = "2시 방향"; icon = "bi-arrow-right"; break;
                                                            case 19: description = "4시 방향"; icon = "bi-arrow-right"; break;
                                                            case 125: description = "로터리 진입"; icon = "bi-arrow-clockwise"; break;
                                                            case 126: description = "로터리 진출"; icon = "bi-arrow-up-right"; break;
                                                            case 127: description = "로터리"; icon = "bi-arrow-clockwise"; break;
                                                            case 128: description = "고가도로 진입"; icon = "bi-arrow-up-circle"; break;
                                                            case 129: description = "고가도로 진출"; icon = "bi-arrow-down-circle"; break;
                                                            case 211: case 212: case 213: case 214: case 215:
                                                                description = "도보 구간"; icon = "bi-person-walking"; break;
                                                            default: description = "직진"; icon = "bi-arrow-up";
                                                        }
                                                    }

                                                    return (
                                                        <div key={index} className="route-step">
                                                            <div className="d-flex align-items-center">
                                                                <i className={`bi ${icon} me-2`}></i>
                                                                <div>
                                                                    <div>{description}</div>
                                                                    <small className="text-muted">
                                                                        {distance}m {feature.properties.description || ''}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : currentStep === 'date' ? (
                        <DateSelector
                            onDateSelect={(dateRange, times, isComplete) => {
                                setSelectedDateRange(dateRange);
                                setSelectedTimes(times);
                                setIsDateSelectionComplete(isComplete);
                                if (isComplete) {
                                    setCurrentStep('place');
                                }
                            }}
                        />
                    ) : currentStep === 'stay' ? (
                        <>
                            {isDateSelectionComplete && renderDateInfo()}
                            <StaySelector {...staySelectorProps} />
                        </>
                    ) : (
                        <>
                            {isDateSelectionComplete && renderDateInfo()}
                            <PlaceSelector {...placeSelectorProps} />
                        </>
                    )}
                </div>

                {/* 선택된 장소/숙박 목록 패널 */}
                {((currentStep === 'place' && selectedPlaces.length > 0) || 
                  (currentStep === 'stay' && selectedStays.length > 0)) && (
                    <div className="selected-places-panel">
                        <div className="p-3 border-bottom">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 className="m-0">
                                        {currentStep === 'place' ? '선택한 장소 목록' : '선택한 숙박 목록'}
                                    </h6>
                                    {currentStep === 'place' && (
                                        <div className="time-info-container">
                                            <small className="text-muted">
                                                총 소요시간: {totalHours}시간 {totalMinutes > 0 ? `${totalMinutes}분` : ''}
                                            </small>
                                            {isDateSelectionComplete && totalAvailableTime > 0 && (
                                                <small className="text-muted">
                                                    / {formatTotalTime(totalAvailableTime)}
                                                </small>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                        if (currentStep === 'place') {
                                            setSelectedPlaces([]);
                                            setPlaceDurations({});
                                            selectedPlaces.forEach(place => parentHandleRemovePlace(place));
                                        } else {
                                            setSelectedStays([]);
                                            selectedStays.forEach(stay => parentHandleRemovePlace(stay));
                                        }
                                    }}
                                >
                                    전체 초기화
                                </button>
                            </div>
                        </div>
                        <div className="overflow-auto h-100 p-3">
                            {/* 선택된 장소 목록 */}
                            {currentStep === 'place' && selectedPlaces.length > 0 && (
                                <div>
                                    {selectedPlaces.map((place, index) => (
                                        <SelectedPlaceItem
                                            key={`place-${index}`}
                                            place={place}
                                            duration={placeDurations[place.title] || 120}
                                            onDurationChange={handleDurationChange}
                                            onRemove={() => {
                                                handleRemovePlace(place);
                                                const newDurations = { ...placeDurations };
                                                delete newDurations[place.title];
                                                setPlaceDurations(newDurations);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                            
                            {/* 선택된 숙박 시설 목록 */}
                            {currentStep === 'stay' && selectedStays.length > 0 && (
                                <div>
                                    {selectedStays.map((stay, index) => (
                                        <SelectedStayItem
                                            key={`stay-${index}`}
                                            stay={stay}
                                            selectedTimes={selectedTimes}
                                            selectedStays={selectedStays}
                                            onDateChange={(stay, date) => {
                                                const updatedStays = selectedStays.map(s => 
                                                    s.title === stay.title ? { ...s, stayDate: date } : s
                                                );
                                                setSelectedStays(updatedStays);
                                            }}
                                            onRemove={handleRemoveStay}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div id="map_div" ref={mapRef} className="map-container" />
            </div>
        </div>
    );
};

export default ScheduleUI;

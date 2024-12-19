import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './ScheduleUI.style.css';
import { SelectedPlaceItem, PlaceSelector, StaySelector, DateSelector, StepButton, STEP_BUTTONS, SelectedStayItem } from './SchedulePlace';
import { generateTravelSchedule } from '../../services/openaiService';
import TravelSchedulePanel from './TravelSchedulePanel';
import Loading from '../../common/Loading';

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
    const [recommendedSchedule, setRecommendedSchedule] = useState(null);
    const [selectedDay, setSelectedDay] = useState(0);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showMainPanel, setShowMainPanel] = useState(true);
    const [isScheduleGenerated, setIsScheduleGenerated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
    const handlePathSelect = async (type) => {
        try {
            setIsLoading(true); // 로딩 시작
            setPathType(type);
            setShowPathModal(false);
            
            const schedule = await generateTravelSchedule(
                selectedPlaces,
                selectedStays,
                selectedDateRange,
                selectedTimes
            );
            setRecommendedSchedule(schedule);
            
            // 첫째 날 로 표시
            if (schedule.days.length > 0) {
                drawDayRoute(schedule.days[0], 0); // 일차 인덱스 추가
            }
            
            // 사이드바와 메인 패널 숨기기
            setShowSidebar(false);
            setShowMainPanel(false);
            setIsScheduleGenerated(true);
        } catch (error) {
            console.error('일정 생성 중 오류:', error);
            alert('일정 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    // 일정 추천 함수
    const generateSchedule = async () => {
        try {
            setShowPathModal(true); // 경로 타입 선택 모달 표시
        } catch (error) {
            console.error('일정 생성 중 오류:', error);
            alert('일정 생성 중 오류가 발생했습니다.');
        }
    };

    // 일차별 경로 그리기
    const drawDayRoute = (day, dayIndex) => {
        const dayPlaces = day.places.map(place => {
            const placeData = selectedPlaces.find(p => p.title === place.title);
            return {
                ...placeData,
                duration: place.duration
            };
        });

        // 숙박 시설 추가
        if (day.stay) {
            const stayData = selectedStays.find(s => s.title === day.stay);
            if (stayData) {
                dayPlaces.push(stayData);
            }
        }

        // dayIndex 전달하여 경로 색상 구분
        searchRoute(dayPlaces, dayIndex);
    };

    // 일차 선택 핸들러
    const handleDaySelect = (dayIndex) => {
        setSelectedDay(dayIndex);
        const dayPlaces = recommendedSchedule.days[dayIndex].places.map(place => {
            const placeData = selectedPlaces.find(p => p.title === place.title);
            return {
                ...placeData,
                duration: place.duration
            };
        });

        // 숙박 시설 추가
        if (recommendedSchedule.days[dayIndex].stay) {
            const stayData = selectedStays.find(s => s.title === recommendedSchedule.days[dayIndex].stay);
            if (stayData) {
                dayPlaces.push(stayData);
            }
        }

        // dayIndex 전달하여 경로 색상 구분
        searchRoute(dayPlaces, dayIndex);
    };

    return (
        <div className="tmap-container">
            {/* 로딩 오버레이 추가 */}
            {isLoading && (
                <div className="loading-overlay">
                    <Loading />
                </div>
            )}

            {/* 사이드바 - 조건부 렌더링 */}
            {!isScheduleGenerated && (
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
                            className="btn btn-primary"
                            onClick={generateSchedule}
                        >
                            일정 생성
                        </button>
                    </div>
                </div>
            )}

            {isScheduleGenerated && (
                <TravelSchedulePanel 
                    schedule={recommendedSchedule}
                    onDaySelect={handleDaySelect}
                    selectedDay={selectedDay}
                />
            )}

            {/* 메인 컨텐츠 */}
            <div className="main-content">
                {/* 왼쪽 패널 - 조건부 렌더링 */}
                {showMainPanel && (
                    <div className="left-panel">
                        {currentStep === 'date' ? (
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
                )}

                {/* 선택된 장소/숙박 록 패널 - 조건부 렌더링 */}
                {showMainPanel && ((currentStep === 'place' && selectedPlaces.length > 0) || 
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

            {/* 경로 타입 선택 모달 */}
            {showPathModal && (
                <div className="modal show d-block">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content path-modal">
                            <div className="modal-header border-0">
                                <h5 className="modal-title">이동수단 선택</h5>
                                <button type="button" className="btn-close" onClick={() => setShowPathModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex gap-3">
                                    <button 
                                        className="path-option-btn flex-grow-1"
                                        onClick={() => handlePathSelect('car')}
                                    >
                                        <div className="icon-wrapper mb-2">
                                            <i className="bi bi-car-front fs-1"></i>
                                        </div>
                                        <span>자동차</span>
                                    </button>
                                    <button 
                                        className="path-option-btn flex-grow-1"
                                        onClick={() => handlePathSelect('transit')}
                                    >
                                        <div className="icon-wrapper mb-2">
                                            <i className="bi bi-bus-front fs-1"></i>
                                        </div>
                                        <span>대중교통</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </div>
            )}
        </div>
    );
};

export default ScheduleUI;

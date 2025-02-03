import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './scss/ScheduleUI.scss';
import { DateSelector, StepButton, STEP_BUTTONS } from './ScheduleDate';
import { PlaceSelector, SelectedPlaceItem } from './SchedulePlace';
import { StaySelector, SelectedStayItem } from './ScheduleStay';
import { generateTravelSchedule } from '../../services/openaiService';
import ScheduleRoute from './ScheduleRoute';
import Loading from '../../common/Loading';
import ScheduleEdit from './ScheduleEdit';

// 선택된 장소들의 총 소요시간 계산
const calculateTotalDuration = (placeDurations) => {
    const totalMinutes = Object.values(placeDurations).reduce((sum, duration) => sum + duration, 0);
    return {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60
    };
};

// 메인 UI 컴포넌트
const ScheduleUI = ({
    mapRef,
    setPathType,
    handleAddPlace: parentHandleAddPlace,
    handleRemovePlace: parentHandleRemovePlace,
    drawDayRoute,
    handleDaySelect: parentHandleDaySelect,
    clearAllRoutes,
    savedSchedule
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
    const [mapLevel, setMapLevel] = useState(12);
    const [showEditMode, setShowEditMode] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [schedule, setSchedule] = useState(null);

    // 총 소요시간 계산
    const { hours: totalHours, minutes: totalMinutes } = calculateTotalDuration(placeDurations);

    useEffect(() => {
        // 저장된 일정이 있으면 바로 일정 표시 모드로 전환
        if (savedSchedule) {
            setRecommendedSchedule(savedSchedule);
            setIsScheduleGenerated(true);
            setShowMainPanel(false);
            setShowSidebar(false);
            
            // 경로 타입 설정 (기본값: 'car')
            setPathType('car');
            
            // 전체 일정 표시
            clearAllRoutes();
            savedSchedule.days.forEach((day, index) => {
                drawDayRoute(day, index);
            });
        }
    }, [savedSchedule]);

    // 새로운 장소를 선택 목록에 추가하고 기본 체류시간(2시간) 설정
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

    // 선택된 장소를 목록에서 제거
    const handleRemovePlace = (placeToRemove) => {
        setSelectedPlaces(prev => prev.filter(place => place.title !== placeToRemove.title));
        parentHandleRemovePlace(placeToRemove);
    };

    // 새로운 숙박 시설을 선택 목록에 추가
    const handleAddStay = (stay) => {
        if (!selectedStays.some(s => s.title === stay.title)) {
            const stayWithType = {
                ...stay,
                markerType: 'stay'
            };
            setSelectedStays(prev => [...prev, stayWithType]);
            parentHandleAddPlace(stayWithType, 'stay');
        }
    };

    // 선택된 숙박 시설을 목록에서 제거
    const handleRemoveStay = (stayToRemove) => {
        setSelectedStays(prev => prev.filter(stay => stay.title !== stayToRemove.title));
        parentHandleRemovePlace(stayToRemove);
    };

    // 특정 장소의 체류 시간을 변경
    const handleDurationChange = (place, duration) => {
        setPlaceDurations(prev => ({
            ...prev,
            [place.title]: duration
        }));
    };

    // 선택된 시간대의 총 가용 시간을 분 단위로 계산
    const calculateTotalAvailableTime = () => {
        if (!selectedTimes || selectedTimes.length === 0) return 0;

        return selectedTimes.reduce((total, dateInfo) => {
            const startHour = parseInt(dateInfo.startTime.split(':')[0]);
            const endHour = parseInt(dateInfo.endTime.split(':')[0]);
            const duration = (endHour - startHour) * 60; // 분 단위로 변환
            return total + duration;
        }, 0);
    };

    // 분 단위 시간을 "X시간 Y분" 형식의 문자열로 변환
    const formatTotalTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}시간${mins > 0 ? ` ${mins}분` : ''}`;
    };

    // 선택된 시간대의 총 가용 시간 계산 결과
    const totalAvailableTime = calculateTotalAvailableTime();

    // 날짜 선택 핸들러
    const handleDateSelect = (dateRange, times, isComplete) => {
        setSelectedDateRange(dateRange);
        setSelectedTimes(times);
        setIsDateSelectionComplete(isComplete);
        if (isComplete) {
            setCurrentStep('place');
        }
    };

    // 장소 선택 완료 처리
    const handlePlaceSelectComplete = () => {
        setShowMainPanel(true);
        setCurrentStep('stay');
    };

    // 장소 관련 props
    const placeSelectorProps = {
        onAddPlace: handleAddPlace,
        onRemovePlace: handleRemovePlace,
        selectedPlaces,
        onComplete: handlePlaceSelectComplete,
        isEditMode: false
    };

    // 숙박 관련 props
    const staySelectorProps = {
        onAddPlace: handleAddStay,
        onRemovePlace: handleRemoveStay,
        selectedPlaces: selectedStays,
        selectedTimes
    };

    // 선택된 여행 날짜 범위를 표시하는 컴포넌트
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

    // 선택된 경로 타입에 따라 AI 기반 여행 일정을 생성하고 지도에 표시
    const handlePathSelect = async (type, existingSchedule = null) => {
        try {
            setIsLoading(true);
            setPathType(type);
            setShowPathModal(false);

            // 기존 일정이 있으면 사용하고, 없으면 새로 생성
            const schedule = existingSchedule || await generateTravelSchedule(
                selectedPlaces,
                selectedStays,
                selectedDateRange,
                selectedTimes
            );

            setRecommendedSchedule(schedule);

            // 전체 일정 표시
            clearAllRoutes();
            schedule.days.forEach((day, index) => {
                drawDayRoute(day, index);
            });

            // 모든 경로가 보이도록 지도 레벨 조정
            if (mapRef.current && mapRef.current.setLevel) {
                mapRef.current.setLevel(5);
            }

            // 새로운 일정 생성 시에만 사이드바와 메인 패널 숨김
            if (!existingSchedule) {
                setShowMainPanel(false);
                setShowSidebar(false);
            }
            setIsScheduleGenerated(true);
        } catch (error) {
            console.error('일정 생성 중 오류:', error);
            alert('일정 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 특정 일차 또는 전체 일정을 지도에 표시
    const handleDaySelect = (dayIndex) => {
        setSelectedDay(dayIndex);
        clearAllRoutes(); // 기존 경로 모두 제거

        if (dayIndex === -1) { // 전체 일정 선택
            recommendedSchedule.days.forEach((day, index) => {
                drawDayRoute(day, index);
            });
        } else { // 특정 일차 선택
            drawDayRoute(recommendedSchedule.days[dayIndex], dayIndex);
        }
    };

    // 경로 타입 선택 모달을 표시하여 일정 생성 시작
    const generateSchedule = async () => {
        try {
            setShowPathModal(true); // 경로 타입 선택 모달 표시
        } catch (error) {
            console.error('일정 생성 중 오류:', error);
            alert('일정 생성 중 오류가 발생했습니다.');
        }
    };

    // 일정 업데이트 처리
    const handleScheduleUpdate = (updatedSchedule) => {
        // 기존 경로 모두 제거
        clearAllRoutes();

        // 추천 일정 업데이트
        setRecommendedSchedule(updatedSchedule);

        // 현재 선택된 일자의 경로만 다시 그리기
        if (selectedDay >= 0 && selectedDay < updatedSchedule.days.length) {
            drawDayRoute(updatedSchedule.days[selectedDay], selectedDay);
        } else {
            // 전체 일정 보기 상태인 경우 모든 일자의 경로 다시 그리기
            updatedSchedule.days.forEach((day, index) => {
                drawDayRoute(day, index);
            });
        }

        // 편집 모드 종료
        setShowEditMode(false);
    };

    // 지도 레벨 설정 함수
    const handleSetMapLevel = (level) => {
        if (mapRef.current && mapRef.current.setLevel) {
            mapRef.current.setLevel(level);
            setMapLevel(level);
        }
    };

    const handleEditSave = async (editedSchedule) => {
        try {
            // 기존 경로 모두 제거
            clearAllRoutes();

            // 일정 업데이트
            handleScheduleUpdate(editedSchedule);

            // 지도 레벨 조정
            handleSetMapLevel(11);

            // 전체 일정 다시 그리기
            for (let i = 0; i < editedSchedule.days.length; i++) {
                await drawDayRoute(editedSchedule.days[i], i);
            }

            setShowEditMode(false);
        } catch (error) {
            console.error('일정 편집 저장 중 오류:', error);
            alert('일정 편집 저장 중 오류가 발생했습니다.');
        }
    };

    const handleUpdateRoute = (daySchedule) => {
        // Tmap 컴포넌트의 ref나 메서드를 호출
        if (mapRef.current) {
            mapRef.current.drawDayRoute(daySchedule);
        }
    };

    return (
        <div className="schedule-container">
            {isEditing ? (
                <ScheduleEdit
                    schedule={schedule}
                    onSave={handleEditSave}
                    onCancel={() => setIsEditing(false)}
                    drawDayRoute={drawDayRoute}
                    clearAllRoutes={clearAllRoutes}
                />
            ) : (
                <div className="tmap-container">
                    {/* 로딩 오버레이 */}
                    {isLoading && (
                        <div className="loading-overlay">
                            <Loading />
                        </div>
                    )}

                    {/* 사이드바 */}
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

                    {/* 일정 패널 */}
                    {recommendedSchedule && (
                        <ScheduleRoute
                            schedule={recommendedSchedule}
                            onDaySelect={handleDaySelect}
                            selectedDay={selectedDay}
                            onScheduleUpdate={handleScheduleUpdate}
                            clearAllRoutes={clearAllRoutes}
                            drawDayRoute={drawDayRoute}
                            setMapLevel={handleSetMapLevel}
                            handlePathSelect={handlePathSelect}
                        />
                    )}

                    {/* 메인 컨텐츠 */}
                    <div className="main-content">
                        {/* 왼쪽 패널 */}
                        {showMainPanel && (
                            <div className="left-panel">
                                {currentStep === 'date' ? (
                                    <DateSelector
                                        onDateSelect={handleDateSelect}
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

                        {/* 선택된 장소/숙박 목록 패널 */}
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
                                    <div className="overflow-auto p-3">
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

                        {/* 지도 컨테이너 */}
                        <div id="map_div" ref={mapRef} className="map-container" />
                    </div>

                    {/* 경로 타입 선택 모달 */}
                    {showPathModal && (
                        <>
                            <div className="modal show d-block" tabIndex="-1">
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content border-0 shadow">
                                        <div className="modal-header bg-primary text-white border-0">
                                            <h5 className="modal-title">
                                                <i className="bi bi-map me-2"></i>
                                                일정 생성하기
                                            </h5>
                                            <button
                                                type="button"
                                                className="btn-close btn-close-white"
                                                onClick={() => setShowPathModal(false)}
                                                aria-label="Close"
                                            />
                                        </div>
                                        <div className="modal-body p-4">
                                            <p className="text-muted mb-4">선호하시는 이동수단을 선택해주세요.</p>
                                            <div className="d-flex justify-content-center gap-4">
                                                <button
                                                    className="transport-card"
                                                    onClick={() => handlePathSelect('car')}
                                                >
                                                    <div className="card border-0 shadow-sm h-100">
                                                        <div className="card-body text-center p-4">
                                                            <div className="transport-icon mb-3">
                                                                <i className="bi bi-car-front"></i>
                                                            </div>
                                                            <h6 className="card-title mb-2">자동차</h6>
                                                            <p className="card-text text-muted small mb-0">
                                                                자가용/렌트카로 이동
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                                <button
                                                    className="transport-card"
                                                    onClick={() => handlePathSelect('transit')}
                                                >
                                                    <div className="card border-0 shadow-sm h-100">
                                                        <div className="card-body text-center p-4">
                                                            <div className="transport-icon mb-3">
                                                                <i className="bi bi-bus-front"></i>
                                                            </div>
                                                            <h6 className="card-title mb-2">대중교통</h6>
                                                            <p className="card-text text-muted small mb-0">
                                                                버스/지하철로 이동
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-backdrop fade show"></div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScheduleUI;

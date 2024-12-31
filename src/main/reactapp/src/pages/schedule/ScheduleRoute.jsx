import React, { useState } from 'react';
import './scss/ScheduleRoute.scss';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ScheduleEdit from './ScheduleEdit';

// 카카오 맵 경로 검색 컴포넌트
const TransportRoute = ({ start, end, onClick }) => (
    <div className="timeline-transport">
        <div
            className="transport-icon-wrapper"
            onClick={(e) => {
                e.stopPropagation();
                onClick(start, end);
            }}
            title="카카오맵으로 경로 보기"
        >
            <i className="bi bi-arrow-down transport-icon"></i>
        </div>
        <span className="transport-text">카카오맵으로 경로 보기</span>
    </div>
);

// 여행 일정 패널 컴포넌트
const ScheduleRoute = ({
    schedule,
    onDaySelect,
    selectedDay,
    onScheduleUpdate,
    clearAllRoutes,
    drawDayRoute,
    setMapLevel
}) => {
    const [selectedFilter, setSelectedFilter] = React.useState('all');
    const [showDays, setShowDays] = React.useState(true);
    const [showModal, setShowModal] = useState(false);
    const [tripTitle, setTripTitle] = useState('');
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);

    // 카카오 맵으로 이동 함수
    const handleRouteClick = (start, end) => {
        const kakaoMapUrl = `https://map.kakao.com/link/to/${end.title},${end.latitude},${end.longitude}/from/${start.title},${start.latitude},${start.longitude}`;
        window.open(kakaoMapUrl, '_blank');
    };

    const handleSave = async () => {
        if (!tripTitle.trim()) {
            alert('여행 제목을 입력해주세요.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
        }

        try {
            const tripData = {
                title: tripTitle,
                startDate: schedule.days[0].date,
                endDate: schedule.days[schedule.days.length - 1].date,
                tripPlan: JSON.stringify(schedule)
            };

            const response = await axios.post('/api/trips/save', tripData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                alert('여행 일정이 저장되었습니다.');
                setShowModal(false);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
            } else {
                alert('저장 중 오류가 발생했습니다.');
            }
            console.error(error);
        }
    };

    // 편집 모드 저장 처리
    const handleEditSave = async (editedSchedule) => {
        try {
            // 기존 경로 모두 제거
            clearAllRoutes();

            // 일정 업데이트
            onScheduleUpdate(editedSchedule);

            // 편집 모드 종료
            setIsEditMode(false);

            // 현재 선택된 일자의 경로 표시
            if (selectedDay >= 0 && selectedDay < editedSchedule.days.length) {
                // 특정 일자 선택 시
                drawDayRoute(editedSchedule.days[selectedDay], selectedDay);
            } else {
                // 전체 일정 선택 시
                editedSchedule.days.forEach((day, index) => {
                    drawDayRoute(day, index);
                });
            }

            // 지도 레벨 조정
            if (setMapLevel) {
                setMapLevel(8);
            }
        } catch (error) {
            console.error('일정 수정 중 오류:', error);
            alert('일정 수정 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="travel-schedule-panel">
            {isEditMode ? (
                <ScheduleEdit
                    schedule={schedule}
                    onSave={handleEditSave}
                    onCancel={() => setIsEditMode(false)}
                    clearAllRoutes={clearAllRoutes}
                    drawDayRoute={drawDayRoute}
                    selectedDayIndex={selectedDay}
                />
            ) : (
                <>
                    <div className="schedule-filter">
                        <div className="d-flex flex-column gap-2">
                            <button
                                onClick={() => {
                                    setSelectedFilter('all');
                                    onDaySelect(-1);
                                    setShowDays(true);
                                }}
                                className={`sidebar-button btn border-0 p-3 rounded-3 ${selectedFilter === 'all'
                                    ? 'text-primary fw-bold bg-primary bg-opacity-10'
                                    : 'text-secondary bg-light'
                                    }`}
                            >
                                <div className="sidebar-button-text">
                                    전체일정
                                </div>
                            </button>
                            {schedule.days.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedFilter(index);
                                        onDaySelect(index);
                                        setShowDays(true);
                                    }}
                                    className={`sidebar-button btn border-0 p-3 rounded-3 ${selectedFilter === index
                                        ? 'text-primary fw-bold bg-primary bg-opacity-10'
                                        : 'text-secondary bg-light'
                                        }`}
                                >
                                    <div className="sidebar-button-text">
                                        {index + 1}일차
                                    </div>
                                </button>
                            ))}
                            <button
                                className="btn btn-primary"
                                onClick={() => setIsEditMode(true)}
                            >
                                편집
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowModal(true)}
                            >
                                저장
                            </button>
                        </div>
                    </div>

                    <div className={`schedule-days ${showDays ? 'active' : ''}`}>
                        {(selectedFilter === 'all' ? schedule.days : [schedule.days[selectedFilter]])
                            .map((day, dayIndex) => {
                                const actualDayIndex = selectedFilter === 'all' ? dayIndex : selectedFilter;
                                const previousDay = schedule.days[actualDayIndex - 1];

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`day-schedule ${selectedDay === actualDayIndex ? 'active' : ''}`}
                                        onClick={() => {
                                            if (selectedFilter === 'all') {
                                                setSelectedFilter(actualDayIndex);
                                                onDaySelect(actualDayIndex);
                                            }
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0">
                                                {actualDayIndex + 1}일차
                                            </h6>
                                            <small className="text-muted">
                                                {new Date(day.date).toLocaleDateString('ko-KR', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    weekday: 'short'
                                                })}
                                            </small>
                                        </div>
                                        <div className="schedule-timeline">
                                            {actualDayIndex > 0 && previousDay.stays && previousDay.stays[0] && (
                                                <>
                                                    <div className="timeline-item start-from-stay">
                                                        <div className="timeline-content">
                                                            <i className="bi bi-house-door me-2"></i>
                                                            <span className="text-truncate" title={previousDay.stays[0].title}>
                                                                {previousDay.stays[0].title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <TransportRoute
                                                        start={previousDay.stays[0]}
                                                        end={day.places[0]}
                                                        onClick={(start, end) => handleRouteClick(start, end, actualDayIndex, 0)}
                                                    />
                                                </>
                                            )}
                                            {day.places.map((place, placeIndex) => (
                                                <React.Fragment key={placeIndex}>
                                                    <div className="timeline-item">
                                                        <div className="timeline-content">
                                                            <span className="order-badge">{placeIndex + 1}</span>
                                                            <span className="text-truncate" title={place.title}>
                                                                {place.title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {placeIndex < day.places.length - 1 && (
                                                        <TransportRoute
                                                            start={place}
                                                            end={day.places[placeIndex + 1]}
                                                            onClick={(start, end) => handleRouteClick(start, end, actualDayIndex, placeIndex + 1)}
                                                        />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                            {day.stays && day.stays[0] && (
                                                <>
                                                    {day.places.length > 0 && (
                                                        <TransportRoute
                                                            start={day.places[day.places.length - 1]}
                                                            end={day.stays[0]}
                                                            onClick={(start, end) => handleRouteClick(start, end, actualDayIndex, day.places.length - 1)}
                                                        />
                                                    )}
                                                    <div className="timeline-item stay">
                                                        <div className="timeline-content">
                                                            <i className="bi bi-house-door me-2"></i>
                                                            <span className="text-truncate" title={day.stays[0].title}>
                                                                {day.stays[0].title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>여행 일정 저장</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>여행 제목 설정</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="여행 제목을 입력하세요"
                                value={tripTitle}
                                onChange={(e) => setTripTitle(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        저장
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ScheduleRoute;
import React from 'react';
import './scss/TravelSchedulePanel.scss';

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
const TravelSchedulePanel = ({ schedule, onDaySelect, selectedDay }) => {
    const [selectedFilter, setSelectedFilter] = React.useState('all');
    const [showDays, setShowDays] = React.useState(true);

    // 카카오 맵으로 이동 함수
    const handleRouteClick = (start, end) => {
        const kakaoMapUrl = `https://map.kakao.com/link/to/${end.title},${end.latitude},${end.longitude}/from/${start.title},${start.latitude},${start.longitude}`;
        window.open(kakaoMapUrl, '_blank');
    };

    return (
        <div className="travel-schedule-panel">
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
                    <button className="btn btn-primary">
                        편집
                    </button>
                    <button className="btn btn-primary">
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
        </div>
    );
};

export default TravelSchedulePanel;
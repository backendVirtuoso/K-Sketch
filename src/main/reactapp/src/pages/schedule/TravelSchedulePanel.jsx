import React from 'react';
import './TravelSchedulePanel.style.css';

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

const TravelSchedulePanel = ({ schedule, onDaySelect, selectedDay }) => {
    const [selectedFilter, setSelectedFilter] = React.useState('all');
    const [showSidebar, setShowSidebar] = React.useState(true);
    const [showMainPanel, setShowMainPanel] = React.useState(true);
    const [recommendedSchedule, setRecommendedSchedule] = React.useState(null);

    // URL에서 사용할 제목 정리 함수 수정
    const cleanTitle = (title) => {
        return title.replace(/\([^)]*\)/g, '').trim();
    };

    // 카카오맵 경로 검색 URL 생성 함수 수정
    const getKakaoMapRouteURL = (start, end, dayIndex) => {
        const baseURL = 'https://map.kakao.com/link/to/';
        const cleanEndTitle = cleanTitle(end.title);
        const cleanStartTitle = cleanTitle(start.title);
        return `${baseURL}${cleanEndTitle},${end.latitude},${end.longitude}/from/${cleanStartTitle},${start.latitude},${start.longitude}`;
    };

    // 경로 검색 핸들러
    const handleRouteClick = (start, end, dayIndex) => {
        const url = getKakaoMapRouteURL(start, end, dayIndex);
        window.open(url, '_blank');
    };

    return (
        <div className="travel-schedule-panel">
            {showSidebar && (
                <div className="schedule-filter">
                    <div className="d-flex flex-wrap gap-2 p-3 border-bottom">
                        <button
                            className={`btn btn-sm ${selectedFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => {
                                setSelectedFilter('all');
                                onDaySelect(0);
                            }}
                        >
                            전체일정
                        </button>
                        {schedule.days.map((_, index) => (
                            <button
                                key={index}
                                className={`btn btn-sm ${selectedFilter === index ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => {
                                    setSelectedFilter(index);
                                    onDaySelect(index);
                                }}
                            >
                                {index + 1}일차
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="schedule-days">
                {schedule.days
                    .filter((_, index) => selectedFilter === 'all' || selectedFilter === index)
                    .map((day, dayIndex) => {
                        const actualDayIndex = selectedFilter === 'all' ? dayIndex : selectedFilter;
                        
                        return (
                            <div 
                                key={dayIndex} 
                                className={`day-schedule ${selectedDay === actualDayIndex ? 'active' : ''}`}
                                onClick={() => onDaySelect(actualDayIndex)}
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
                                    {day.places.map((place, placeIndex) => (
                                        <React.Fragment key={placeIndex}>
                                            <div className="timeline-item">
                                                <div className="timeline-time">
                                                    {Math.floor(place.duration / 60)}시간 
                                                    {place.duration % 60 > 0 ? ` ${place.duration % 60}분` : ''}
                                                </div>
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
                                                    onClick={(start, end) => handleRouteClick(start, end, actualDayIndex)}
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
                                                    onClick={(start, end) => handleRouteClick(start, end, actualDayIndex)}
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
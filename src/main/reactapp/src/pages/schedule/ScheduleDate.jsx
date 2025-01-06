import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import './scss/ScheduleDate.scss';

// 날짜 선택 컴포넌트
const DateSelector = ({ onDateSelect }) => {
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
            onDateSelect([startDate, endDate], dates);
        }
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

    // 헤더용 날짜 포맷
    const formatHeaderDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' });
        return `${year}.${month}.${day} (${weekday})`;
    };

    // 일자별 날짜 포맷 (기존 그대로 유지)
    const formatDateKorean = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' });
        return `${month}.${day} (${weekday})`;
    };

    const formatTime = (hour) => {
        const ampm = hour < 12 ? '오전' : '오후';
        const displayHour = hour < 12 ? hour : hour === 12 ? hour : hour - 12;
        return `${ampm} ${String(displayHour).padStart(2, '0')}:00`;
    };

    return (
        <div className="h-100 overflow-hidden">
            {!showTimeSelector ? (
                <div>
                    <h5 className="mb-3">언제가세요?</h5>
                    <p className="text-primary small mb-4">
                        <i className="bi bi-info-circle me-2"></i>
                        현재 10일까지 선택 가능
                    </p>

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
                        showMonthYearDropdown
                        renderCustomHeader={({
                            date,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled
                        }) => (
                            <div className="d-flex justify-content-between align-items-center px-2 py-2">
                                <button
                                    onClick={decreaseMonth}
                                    disabled={prevMonthButtonDisabled}
                                    type="button"
                                    className="btn btn-link text-dark p-0"
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                <span className="fw-bold">
                                    {date.getFullYear()}년 {date.getMonth() + 1}월
                                </span>
                                <button
                                    onClick={increaseMonth}
                                    disabled={nextMonthButtonDisabled}
                                    type="button"
                                    className="btn btn-link text-dark p-0"
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    />

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
                <div>
                    <div className="d-flex align-items-center justify-content-between mb-3 p-3 border-bottom">
                        <h6 className="m-0">
                            {formatHeaderDate(startDate)} - {formatHeaderDate(endDate)}
                        </h6>
                        <button
                            className="btn btn-link text-primary p-0"
                            onClick={() => setShowTimeSelector(false)}
                        >
                            <i className="bi bi-calendar3 fs-5"></i>
                        </button>
                    </div>
                    <div className="time-selector-container">
                        {selectedDates.map((dateInfo, index) => (
                            <div key={index} className="border-bottom">
                                <div className="d-flex align-items-center py-3">
                                    <div className="date-cell">
                                        <div className="text-muted small">일자</div>
                                        <div className="fw-medium date-text">
                                            {formatDateKorean(dateInfo.date)}
                                        </div>
                                    </div>

                                    <div className="time-cell">
                                        <div className="text-muted small">시작시간</div>
                                        <select
                                            className="form-select form-select-sm border-0 p-0 time-select"
                                            value={dateInfo.startTime}
                                            onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                                        >
                                            {Array.from({ length: 24 }, (_, i) => {
                                                const timeValue = `${String(i).padStart(2, '0')}:00`;
                                                return (
                                                    <option key={i} value={timeValue}>
                                                        {formatTime(i)}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    <div className="arrow-cell d-flex align-items-end mb-1">
                                        <span>→</span>
                                    </div>

                                    <div className="time-cell">
                                        <div className="text-muted small">종료시간</div>
                                        <select
                                            className="form-select form-select-sm border-0 p-0 time-select"
                                            value={dateInfo.endTime}
                                            onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                                        >
                                            {Array.from({ length: 24 }, (_, i) => {
                                                const timeValue = `${String(i).padStart(2, '0')}:00`;
                                                return (
                                                    <option key={i} value={timeValue}>
                                                        {formatTime(i)}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="time-selector-actions">
                        <button
                            className="btn btn-primary w-100"
                            onClick={() => {
                                onDateSelect([startDate, endDate], selectedDates, true);
                            }}
                        >
                            시간 설정 완료
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 사이드바 버튼 데이터
const STEP_BUTTONS = [
    { id: 'date', step: 1, text: '날짜 선택' },
    { id: 'place', step: 2, text: '장소 선택' },
    { id: 'stay', step: 3, text: '숙박 선택' },
];

// 사이드바 버튼 컴포넌트
const StepButton = ({ id, step, text, currentStep, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`sidebar-button btn border-0 p-3 rounded-3 ${currentStep === id
            ? 'text-primary fw-bold bg-primary bg-opacity-10'
            : 'text-secondary bg-light'
            }`}
    >
        <div className="sidebar-button-text">
            STEP {step}<br />{text}
        </div>
    </button>
);

export { DateSelector, STEP_BUTTONS, StepButton };
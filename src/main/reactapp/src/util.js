export const weekDayNames = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
];

export const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
];

export const getDate = (dateUnix) => {
    const date = new Date(dateUnix * 1000);
    const weekDayName = weekDayNames[date.getDay()];
    const monthName = monthNames[date.getMonth()];

    return `${monthName} ${date.getDate()}일 ${weekDayName}`;
};

export const getTime = (timeUnix) => {
    const date = new Date(timeUnix * 1000);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
};

export const getHours = (timeUnix) => {
    const date = new Date(timeUnix * 1000);
    const hours = date.getHours().toString().padStart(2, "0");

    return `${hours}:00`;
};
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

export const generateTravelSchedule = async (places, stays, dateRange, selectedTimes) => {
    try {
        // 장소와 숙소 정보를 결합하여 컨텍스트 생성
        const contextData = places.map(place => ({
            title: place.title,
            description: place.description || '',
            address: place.address || '',
            latitude: place.latitude,
            longitude: place.longitude,
            recommendedDuration: '2시간'
        }));

        const staysContext = stays.map(stay => ({
            title: stay.title,
            address: stay.address || '',
            latitude: stay.latitude,
            longitude: stay.longitude,
            stayDate: stay.stayDate ? new Date(stay.stayDate).toLocaleDateString() : '날짜 미정'
        }));

        // 날짜 형식 변환
        const formattedDates = selectedTimes.map(time => ({
            date: time.date.toLocaleDateString(),
            startTime: time.startTime,
            endTime: time.endTime
        }));

        const prompt = `여행 일정 생성을 위한 상세 정보:

        장소 정보:
        ${JSON.stringify(contextData, null, 2)}

        숙소 정보:
        ${JSON.stringify(staysContext, null, 2)}

        여행 기간: ${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}
        일별 활동 시간: ${formattedDates.map(d => `${d.date} ${d.startTime}-${d.endTime}`).join(', ')}

        위 정보를 바탕으로 다음 기준에 따라 최적의 여행 일정을 생성해주세요:
        1. 각 장소 간의 거리와 이동 시간을 고려
        2. 숙소 위치와의 연계성 고려
        3. 일별 활동 시간 내에서 효율적인 동선 계획
        4. 각 장소의 추천 방문 시간 준수
        5. 각 장소의 위치(위도, 경도)를 활용하여 효율적인 동선을 계획합니다.
        6. 여행 일정 규칙:
            - 1일차: 선택한 첫 장소에서 시작하여 마지막은 1일차 숙소로 종료
            - 2일차: 1일차 숙소에서 출발하여 2일차 숙소로 종료
            - 3일차: 2일차 숙소에서 출발하여 3일차 숙소로 종료
            - 마지막 날: 이전 날의 숙소에서 출발하여 마지막 장소에서 종료
        7. 각 날짜별로 지정된 시작 시간과 종료 시간을 준수합니다.
        8. 각 날의 첫 번째 장소는 반드시 이전 날의 숙소 위치에서 시작합니다 (첫째 날 제외).
        9. 장소들 간의 이동 거리와 시간을 고려하여 최 적의 경로를 생성합니다.
        10. 식당/음식점 관련 장소는 전체 여행 기간에 걸쳐 균등하게 분배합니다:
            - 전체 식당 개수를 여행 일수로 나누어 일자별로 동일한 수의 식당을 배정
            - 가능한 점심과 저녁 시간대에 맞추어 식당을 배치
            - 식당 간의 방문은 최소 3시간 이상의 간격을 두어 배치

        다음 JSON 형식으로 응답해주세요:
        {
            "days": [
                {
                    "date": "YYYY-MM-DD",
                    "places": [
                        {
                            "title": "장소명",
                            "duration": 120,
                            "order": 1,
                            "latitude": 위도값,
                            "longitude": 경도값
                        }
                    ],
                    "stays": [
                        {
                            "title": "숙소명",
                            "latitude": 위도값,
                            "longitude": 경도값,
                            "stayDate": "YYYY-MM-DD"
                        }
                    ]
                }
            ]
        }`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "당신은 여행 일정 최적화 전문가입니다. 제공된 장소와 숙소의 위치 데이터, 운영 시간, 거리 정보를 분석하여 가장 효율적인 여행 일정을 생성합니다. 응답은 반드시 지정된 JSON 형식을 따라야 하며, 일반 텍스트 설명이나 추가 메시지를 포함하지 마세요."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.2,
            max_tokens: 1500,
            top_p: 1
        });

        try {
            const schedule = JSON.parse(completion.choices[0].message.content);
            console.log('Generated schedule:', schedule);
            return schedule;
        } catch (error) {
            console.error('JSON 파싱 오류:', completion.choices[0].message.content);
            throw new Error('유효하지 않은 일정 데이터가 생성되었습니다. 다시 시도해주세요.');
        }

    } catch (error) {
        console.error('OpenAI API 호출 중 오류:', error);
        throw error;
    }
}; 
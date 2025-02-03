import React, { useEffect, useRef, useState } from 'react';
import ScheduleUI from './ScheduleUI';
import { useParams, useLocation } from 'react-router-dom';

// 일자별 경로 색상 정의 (10가지 색상)
const DAY_COLORS = [
    "#FF0000", // 빨강 (1일차)
    "#00FF00", // 초록 (2일차)
    "#0000FF", // 파랑 (3일차)
    "#FF00FF", // 보라 (4일차)
    "#FFA500", // 주황 (5일차)
    "#00FFFF", // 하늘 (6일차)
    "#800080", // 진보라 (7일차)
    "#008000", // 진초록 (8일차)
    "#FF4500", // 오렌지레드 (9일차)
    "#4B0082"  // 남색 (10일차)
];

const ScheduleTmap = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [pathType, setPathType] = useState('car');
    const [currentMarkers, setCurrentMarkers] = useState([]);
    const [currentPolylines, setCurrentPolylines] = useState([]);
    const [viaPoints, setViaPoints] = useState([]);
    const [savedSchedule, setSavedSchedule] = useState(null);
    const { tripId } = useParams();
    const location = useLocation();
    const tripData = location.state?.tripData;

    useEffect(() => {
        const initTmap = () => {
            const mapDiv = document.getElementById('map_div');
            if (!mapDiv) return;

            try {
                if (!window.Tmapv2) {
                    console.error('Tmap API가 로드되지 않았습니다.');
                    return;
                }

                const tmap = new window.Tmapv2.Map('map_div', {
                    center: new window.Tmapv2.LatLng(37.49241689559544, 127.03171389453507),
                    width: '100%',
                    height: '100%',
                    zoom: 11,
                    zoomControl: true,
                    scrollwheel: true,
                });
                setMap(tmap);
            } catch (error) {
                console.error('지도 초기화 중 오류:', error);
            }
        };

        // 지도 div가 존재하는지 확인 후 초기화
        const checkAndInitMap = () => {
            if (document.getElementById('map_div')) {
                initTmap();
            } else {
                setTimeout(checkAndInitMap, 100);
            }
        };

        checkAndInitMap();
    }, []);

    useEffect(() => {
        const loadSavedSchedule = async () => {
            if (tripId && tripData) {
                try {
                    const parsedSchedule = JSON.parse(tripData.tripPlan);
                    setSavedSchedule(parsedSchedule);

                    if (parsedSchedule && parsedSchedule.days && map) {
                        clearAllRoutes();
                        for (const [index, day] of parsedSchedule.days.entries()) {
                            await drawDayRoute(day, index);
                        }
                    }
                } catch (error) {
                    console.error('일정 데이터 로드 중 오류:', error);
                }
            }
        };

        if (map) {
            loadSavedSchedule();
        }
    }, [tripId, tripData, map]);

    // 경로 초기화 함수
    const clearAllRoutes = () => {
        try {
            // 기존 마커 제거
            currentMarkers.forEach(marker => {
                if (marker && marker.marker && marker.marker.getMap) {
                    marker.marker.setMap(null);
                }
            });
            setCurrentMarkers([]);

            // 기존 경로선 제거
            currentPolylines.forEach(polyline => {
                if (polyline && polyline.getMap) {
                    polyline.setMap(null);
                }
            });
            setCurrentPolylines([]);
        } catch (error) {
            console.error('경로 초기화 중 오류:', error);
        }
    };

    // 두 지점 간 경로 검색 함수 추가
    const searchRouteBetweenPoints = async (start, end, routeColor) => {
        if (!map) {
            console.error('지도 객체가 초기화되지 않았습니다.');
            return;
        }

        if (!start || !end) {
            console.warn('유효한 경로 포인트가 없습니다.');
            return;
        }

        try {
            // 좌표 데이터 확인 및 로깅
            const startLon = start.longitude || start.lon || start.mapx;
            const startLat = start.latitude || start.lat || start.mapy;
            const endLon = end.longitude || end.lon || end.mapx;
            const endLat = end.latitude || end.lat || end.mapy;

            console.log('시작 좌표:', startLat, startLon);
            console.log('도착 좌표:', endLat, endLon);

            if (!startLat || !startLon || !endLat || !endLon) {
                console.error('유효하지 않은 좌표 데이터');
                return;
            }

            const headers = {
                'Content-Type': 'application/json',
                'appKey': process.env.REACT_APP_TMAP_KEY
            };

            let url, requestBody;

            if (pathType === 'transit') {
                url = 'https://apis.openapi.sk.com/transit/routes';
                requestBody = {
                    startX: startLon.toString(),
                    startY: startLat.toString(),
                    endX: endLon.toString(),
                    endY: endLat.toString(),
                    format: 'json',
                    count: 1
                };
            } else {
                url = 'https://apis.openapi.sk.com/tmap/routes?version=1&format=json';
                requestBody = {
                    startX: startLon.toString(),
                    startY: startLat.toString(),
                    endX: endLon.toString(),
                    endY: endLat.toString(),
                    reqCoordType: 'WGS84GEO',
                    resCoordType: 'WGS84GEO',
                    searchOption: '0',
                    trafficInfo: 'Y'
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            const newPolylines = [];

            if (pathType === 'transit') {
                const itinerary = data.metaData?.plan?.itineraries?.[0];
                if (itinerary?.legs) {
                    itinerary.legs.forEach(leg => {
                        if (leg.passShape?.linestring) {
                            try {
                                const coordinates = leg.passShape.linestring
                                    .split(' ')
                                    .map(coord => {
                                        const [lon, lat] = coord.split(',').map(Number);
                                        return new window.Tmapv2.LatLng(lat, lon);
                                    });

                                const polyline = new window.Tmapv2.Polyline({
                                    path: coordinates,
                                    strokeColor: routeColor,
                                    strokeWeight: 3,
                                    strokeStyle: 'dash',
                                    strokeOpacity: 0.7,
                                    map: map
                                });

                                newPolylines.push(polyline);
                            } catch (e) {
                                console.warn('폴리라인 생성 중 오류:', e);
                            }
                        }
                    });
                }
            } else {
                if (data.features) {
                    data.features.forEach(feature => {
                        if (feature.geometry.type === 'LineString') {
                            try {
                                const coordinates = feature.geometry.coordinates.map(coord =>
                                    new window.Tmapv2.LatLng(coord[1], coord[0])
                                );

                                const polyline = new window.Tmapv2.Polyline({
                                    path: coordinates,
                                    strokeColor: routeColor,
                                    strokeWeight: 3,
                                    strokeStyle: 'dash',
                                    strokeOpacity: 0.7,
                                    map: map
                                });

                                newPolylines.push(polyline);
                            } catch (e) {
                                console.warn('폴리라인 생성 중 오류:', e);
                            }
                        }
                    });
                }
            }

            setCurrentPolylines(prev => [...prev, ...newPolylines]);
        } catch (error) {
            console.error('경로 검색 오류:', error);
        }
    };

    // 마커 생성 함수
    const createMarker = (location, label, order, color, markerType = 'place') => {
        const markerPosition = new window.Tmapv2.LatLng(location.lat, location.lon);

        // 마커 스타일 설정
        let markerHtml;
        if (markerType === 'stay') {
            // 숙소 마커 스타일
            markerHtml = `
                <div style="
                    width: 24px;
                    height: 24px;
                    background-color: ${color};
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 12px;
                ">
                    <i class="bi bi-house-door"></i>
                </div>
            `;
        } else {
            // 일반 장소 마커 스타일
            markerHtml = `
                <div style="
                    width: 24px;
                    height: 24px;
                    background-color: ${color};
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                ">
                    ${order || ''}
                </div>
            `;
        }

        const marker = new window.Tmapv2.Marker({
            position: markerPosition,
            icon: markerHtml,
            iconHTML: markerHtml,
            map: map,
            title: location.name
        });

        // 마커 클릭 이벤트 추가
        marker.addListener('click', function () {
            const infoWindow = new window.Tmapv2.InfoWindow({
                position: markerPosition,
                content: `
                <div style="padding: 8px;">
                    <strong>${location.name}</strong>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #666;">
                        ${location.address || ''}
                    </p>
                </div>
            `,
                type: 2,
                map: map
            });
        });

        return marker;
    };

    // 일자별 경로 그리는 함수
    const drawDayRoute = async (day, dayIndex) => {
        if (!map || !day || !day.places || day.places.length === 0) {
            console.error('유효하지 않은 데이터');
            return;
        }

        try {
            const routeColor = DAY_COLORS[dayIndex % DAY_COLORS.length];
            let allPoints = [...day.places];

            // 숙소 정보가 있으면 마지막 장소로 추가
            if (day.stays && day.stays[0]) {
                allPoints.push(day.stays[0]);
            }

            // 모든 장소에 대해 마커 생성
            allPoints.forEach((point, index) => {
                const isStay = index === allPoints.length - 1 && day.stays && day.stays[0];
                const marker = createMarker(
                    {
                        lat: point.latitude,
                        lon: point.longitude,
                        name: point.title,
                        address: point.addr1
                    },
                    point.title,
                    index + 1,
                    routeColor,
                    isStay ? 'stay' : 'place'
                );
                setCurrentMarkers(prev => [...prev, { type: isStay ? 'stay' : 'place', marker }]);
            });

            // 경로 그리기
            for (let i = 0; i < allPoints.length - 1; i++) {
                const start = allPoints[i];
                const end = allPoints[i + 1];
                await searchRouteBetweenPoints(
                    {
                        latitude: start.latitude,
                        longitude: start.longitude
                    },
                    {
                        latitude: end.latitude,
                        longitude: end.longitude
                    },
                    routeColor
                );
            }

            // 지도 범위 조정
            if (allPoints.length > 0) {
                const bounds = new window.Tmapv2.LatLngBounds();
                allPoints.forEach(point => {
                    bounds.extend(new window.Tmapv2.LatLng(point.latitude, point.longitude));
                });
                map.fitBounds(bounds, { padding: 50 });
            }
        } catch (error) {
            console.error('경로 그리기 중 오류:', error);
        }
    };

    // 일자 선택 함수
    const handleDaySelect = async (dayIndex, recommendedSchedule) => {
        try {
            clearAllRoutes();

            if (dayIndex === -1) {
                // 전체 일정 표시
                for (let i = 0; i < recommendedSchedule.days.length; i++) {
                    await drawDayRoute(recommendedSchedule.days[i], i);
                }
            } else if (recommendedSchedule.days[dayIndex]) {
                // 특정 일차 표시
                await drawDayRoute(recommendedSchedule.days[dayIndex], dayIndex);
            }
        } catch (error) {
            console.error('일차 선택 처리 오류:', error);
        }
    };

    // handleAddPlace 함수 수정
    const handleAddPlace = (place, type = 'place') => {
        const searchPOI = async (keyword) => {
            const headers = {
                appKey: process.env.REACT_APP_TMAP_KEY
            };

            try {
                const response = await fetch(
                    `https://apis.openapi.sk.com/tmap/pois?${new URLSearchParams({
                        version: 1,
                        format: 'json',
                        searchKeyword: keyword,
                        resCoordType: 'WGS84GEO',
                        reqCoordType: 'WGS84GEO',
                        count: 1
                    })}`,
                    { headers }
                );
                const data = await response.json();

                if (data.searchPoiInfo?.pois?.poi?.length > 0) {
                    const poi = data.searchPoiInfo.pois.poi[0];
                    return {
                        lat: parseFloat(poi.noorLat),
                        lon: parseFloat(poi.noorLon),
                        name: poi.name,
                        address: `${poi.upperAddrName} ${poi.middleAddrName} ${poi.lowerAddrName}`
                    };
                }
                return null;
            } catch (error) {
                console.error('POI 검색 오류:', error);
                return null;
            }
        };

        const addPlaceMarker = async () => {
            let locationData;

            if (place.mapx && place.mapy) {
                locationData = {
                    lat: parseFloat(place.mapy),
                    lon: parseFloat(place.mapx),
                    name: place.title,
                    address: place.addr1
                };
            } else {
                locationData = await searchPOI(place.title);
            }

            if (locationData) {
                if (map) {
                    const moveLatLon = new window.Tmapv2.LatLng(locationData.lat, locationData.lon);
                    map.setCenter(moveLatLon);
                    map.setZoom(15);
                }

                const marker = createMarker(
                    locationData,
                    locationData.name,
                    currentMarkers.length + 1,
                    DAY_COLORS[0],
                    type
                );
                setCurrentMarkers(prev => [...prev, { type, marker }]);
                setViaPoints(prev => [...prev, locationData]);
            }
        };

        addPlaceMarker();
    };

    // 경유지 제거
    const handleRemovePlace = (place) => {
        // viaPoints에서 제거
        setViaPoints(prev => prev.filter(p => p.name !== place.title));

        // 모든 마커 제거 후 재생성
        currentMarkers.forEach(marker => {
            if (marker.marker) {
                marker.marker.setMap(null);
            }
        });

        // 현재 마커 목록 초기화
        setCurrentMarkers([]);

        // viaPoints에 남아있는 장소들에 대해 마커 재생성
        viaPoints.forEach((point, index) => {
            if (point.name !== place.title) { // 삭제된 장소 제외
                const marker = createMarker(
                    point,
                    point.name,
                    index + 1,
                    DAY_COLORS[0]
                );
                setCurrentMarkers(prev => [...prev, { type: 'place', marker }]);
            }
        });
    };

    return (
        <ScheduleUI
            mapRef={mapRef}
            setPathType={setPathType}
            handleAddPlace={handleAddPlace}
            handleRemovePlace={handleRemovePlace}
            drawDayRoute={drawDayRoute}
            handleDaySelect={handleDaySelect}
            clearAllRoutes={clearAllRoutes}
            savedSchedule={savedSchedule}
        />
    );
};

export default ScheduleTmap;
import React, { useEffect, useRef, useState } from 'react';
import ScheduleUI from './ScheduleUI';

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

  useEffect(() => {
    const initTmap = () => {
      const mapDiv = mapRef.current;
      if (!mapDiv.firstChild) {
        const tmap = new window.Tmapv2.Map('map_div', {
          center: new window.Tmapv2.LatLng(37.49241689559544, 127.03171389453507),
          width: '100%',
          height: '100%',
          zoom: 11,
          zoomControl: true,
          scrollwheel: true,
        });
        setMap(tmap);
      }
    };
    initTmap();
  }, []);

  // 경로 초기화 함수
  const clearAllRoutes = () => {
    try {
      currentPolylines.forEach(polyline => {
        if (polyline && polyline.getMap()) {
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
    if (!start || !end) {
      console.warn('유효한 경로 포인트가 없습니다.');
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'appKey': process.env.REACT_APP_TMAP_KEY
      };

      let url, requestBody;

      if (pathType === 'transit') {
        url = 'https://apis.openapi.sk.com/transit/routes';
        requestBody = {
          startX: start.lon.toString(),
          startY: start.lat.toString(),
          endX: end.lon.toString(),
          endY: end.lat.toString(),
          format: 'json',
          count: 1
        };
      } else {
        url = 'https://apis.openapi.sk.com/tmap/routes?version=1&format=json';
        requestBody = {
          startX: start.lon.toString(),
          startY: start.lat.toString(),
          endX: end.lon.toString(),
          endY: end.lat.toString(),
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
  const createMarker = (location, label, order, color) => {
    const markerPosition = new window.Tmapv2.LatLng(location.lat, location.lon);
    
    // 마커 스타일 설정
    const markerHtml = `
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
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        ${order}
      </div>
    `;

    const marker = new window.Tmapv2.Marker({
        position: markerPosition,
        icon: markerHtml,
        iconHTML: markerHtml,
        map: map,
        title: location.name
    });

    // 마커 클릭 이벤트 추가
    marker.addListener('click', function() {
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
    if (!day || !day.places || day.places.length < 2) {
      console.warn('유효한 일정 데이터가 없습니다.');
      return;
    }

    try {
      // 기존 마커 제거
      currentMarkers.forEach(marker => {
        if (marker.marker) {
          marker.marker.setMap(null);
        }
      });
      setCurrentMarkers([]);

      const dayPlaces = day.places.map(place => {
        const placeData = viaPoints.find(p => p.name === place.title);
        return placeData ? {
          ...placeData,
          duration: place.duration
        } : null;
      }).filter(place => place !== null);

      if (dayPlaces.length >= 2) {
        const routeColor = DAY_COLORS[dayIndex % DAY_COLORS.length];

        // 모든 장소에 대해 마커 생성 - 색상 전달
        dayPlaces.forEach((place, index) => {
          const marker = createMarker(place, place.name, index + 1, routeColor);
          setCurrentMarkers(prev => [...prev, { type: 'place', marker }]);
        });

        // 모든 연속된 장소 간의 경로 검색
        for (let i = 0; i < dayPlaces.length - 1; i++) {
          await searchRouteBetweenPoints(dayPlaces[i], dayPlaces[i + 1], routeColor);
        }

        // 마지막 장소에서 숙소로의 경로 (숙소가 있는 경우)
        if (day.stays && day.stays[0]) {
          const stayData = viaPoints.find(p => p.name === day.stays[0].title);
          if (stayData) {
            // 숙소 마커 생성 - 같은 색상 사용
            const stayMarker = createMarker(stayData, stayData.name, '숙', routeColor);
            setCurrentMarkers(prev => [...prev, { type: 'stay', marker: stayMarker }]);

            await searchRouteBetweenPoints(
              dayPlaces[dayPlaces.length - 1],
              stayData,
              routeColor
            );
          }
        }
      }
    } catch (error) {
      console.error('일차별 경로 그리기 오류:', error);
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
  const handleAddPlace = (place) => {
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

      // POI 검색 결과에서 위도/경도가 있는 경우
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
        // 지도 중심 이동
        if (map) {
          const moveLatLon = new window.Tmapv2.LatLng(locationData.lat, locationData.lon);
          map.setCenter(moveLatLon);
          map.setZoom(15); // 적절한 줌 레벨로 설정
        }

        // 마커 생성 및 표시
        const marker = createMarker(
          locationData,
          locationData.name,
          currentMarkers.length + 1,
          DAY_COLORS[0]
        );
        setCurrentMarkers(prev => [...prev, { type: 'place', marker }]);
        
        // viaPoints에 추가
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
    />
  );
};

export default ScheduleTmap;
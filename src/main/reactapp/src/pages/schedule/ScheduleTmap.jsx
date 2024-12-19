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
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('start');
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [pathType, setPathType] = useState('car');
  const [routeResult, setRouteResult] = useState('');
  const [currentMarkers, setCurrentMarkers] = useState([]);
  const [currentPolylines, setCurrentPolylines] = useState([]);
  const [transitDetails, setTransitDetails] = useState(null);
  const [viaPoints, setViaPoints] = useState([]);
  const [routeDetails, setRouteDetails] = useState(null);
  const [dayRoutes, setDayRoutes] = useState({});
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

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

  // 키워드로 장소 검색 (주소 검색 + POI 검색)
  const handleSearch = async () => {
    if (keyword.trim() === '') {
      alert('검색어를 입력해주세요.');
      return;
    }

    const headers = {
      appKey: process.env.REACT_APP_TMAP_KEY
    };

    try {
      const addressResponse = await fetch(
        `https://apis.openapi.sk.com/tmap/geo/postcode?${new URLSearchParams({
          coordType: 'WGS84GEO',
          addressFlag: 'F00',
          format: 'json',
          page: 1,
          count: 5,
          addr: keyword
        })}`,
        { headers }
      );
      const addressData = await addressResponse.json();

      const poiResponse = await fetch(
        `https://apis.openapi.sk.com/tmap/pois?${new URLSearchParams({
          version: 1,
          format: 'json',
          searchKeyword: keyword,
          resCoordType: 'WGS84GEO',
          reqCoordType: 'WGS84GEO',
          count: 5
        })}`,
        { headers }
      );
      const poiData = await poiResponse.json();

      const combinedResults = [];

      if (addressData.coordinateInfo?.coordinate) {
        const addressResults = addressData.coordinateInfo.coordinate.map(item => ({
          lat: item.lat,
          lon: item.lon,
          name: formatRoadAddress(item),
          type: 'address',
          rawData: item
        }));
        combinedResults.push(...addressResults);
      }

      if (poiData.searchPoiInfo?.pois?.poi) {
        const poiResults = poiData.searchPoiInfo.pois.poi.map(item => ({
          lat: item.noorLat,
          lon: item.noorLon,
          name: item.name,
          address: item.upperAddrName + ' ' + item.middleAddrName + ' ' + item.lowerAddrName,
          type: 'poi'
        }));
        combinedResults.push(...poiResults);
      }

      setResults(combinedResults);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // 도명 주소 포맷팅
  const formatRoadAddress = (result) => {
    let address = `${result.city_do} ${result.gu_gun}`;
    if (result.eup_myun) {
      address += ` ${result.eup_myun}`;
    }
    address += ` ${result.newRoadName} ${result.newBuildingIndex}`;
    if (result.buildingName) {
      address += ` (${result.buildingName})`;
    }
    return address;
  };

  // 검색 결과에서 장소 선택 시 마커 생성 및 상태 업데이트
  const handleSelectLocation = (location) => {
    const point = {
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      address: location.type === 'address' ? location.name : location.address,
      name: location.name
    };

    // via 포인트의 현재 개수를 기준으로 마커 번호 결정
    const markerNumber = viaPoints.length + 1;

    const marker = new window.Tmapv2.Marker({
      position: new window.Tmapv2.LatLng(point.lat, point.lon),
      icon: searchType === 'start'
        ? 'https://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_s.png'
        : searchType === 'end'
          ? 'https://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_e.png'
          : `https://tmapapi.tmapmobility.com/upload/tmap/marker/pin_b_m_${markerNumber}.png`,  // 숫자 마커로 변경
      iconSize: new window.Tmapv2.Size(24, 38),
      map: map
    });

    if (searchType === 'via') {
      setViaPoints(prev => [...prev, point]);
    } else {
      if (searchType === 'start') {
        currentMarkers.forEach(m => {
          if (m.type === 'start') m.marker.setMap(null);
        });
        setStartPoint(point);
      } else {
        currentMarkers.forEach(m => {
          if (m.type === 'end') m.marker.setMap(null);
        });
        setEndPoint(point);
      }
    }

    setCurrentMarkers(prev => [
      ...prev.filter(m => m.type !== searchType),
      { type: searchType, marker }
    ]);

    setResults([]);
    setKeyword('');
  };

  // 경로 초기화 함수 수정
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
                  strokeWeight: 6,
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
                  strokeWeight: 6,
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

  // drawDayRoute 함수 수정
  const drawDayRoute = async (day, dayIndex) => {
    if (!day || !day.places || day.places.length < 2) {
      console.warn('유효한 일정 데이터가 없습니다.');
      return;
    }

    try {
      const dayPlaces = day.places.map(place => {
        const placeData = viaPoints.find(p => p.name === place.title);
        return placeData ? {
          ...placeData,
          duration: place.duration
        } : null;
      }).filter(place => place !== null);

      if (dayPlaces.length >= 2) {
        const routeColor = DAY_COLORS[dayIndex % DAY_COLORS.length];
        
        // 모든 연속된 장소 간의 경로 검색
        for (let i = 0; i < dayPlaces.length - 1; i++) {
          await searchRouteBetweenPoints(dayPlaces[i], dayPlaces[i + 1], routeColor);
        }

        // 마지막 장소에서 숙소로의 경로 (숙소가 있는 경우)
        if (day.stays && day.stays[0]) {
          const stayData = viaPoints.find(p => p.name === day.stays[0].title);
          if (stayData) {
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

  // handleDaySelect 함수 수정
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

  // 새로운 장소 추가 (경유지로)
  const handleAddPlace = (place) => {
    // POI 검색으로 위경도 조회
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

    // 장소 마커 추가
    const addPlaceMarker = async () => {
      let locationData;

      // 좌표가 있는 경우 (mapx, mapy)
      if (place.mapx && place.mapy) {
        locationData = {
          lat: parseFloat(place.mapy),
          lon: parseFloat(place.mapx),
          name: place.title,
          address: place.addr1
        };
      } else {
        // 좌표가 없는 경우 POI 검색 수행
        locationData = await searchPOI(place.title);
      }

      if (locationData) {
        // 경유지 마커 생성
        const marker = new window.Tmapv2.Marker({
          position: new window.Tmapv2.LatLng(locationData.lat, locationData.lon),
          icon: 'https://tmapapi.tmapmobility.com/upload/tmap/marker/pin_b_m_p.png',
          iconSize: new window.Tmapv2.Size(24, 38),
          map: map
        });

        // 경유지 목록에 추가
        setViaPoints(prev => [...prev, locationData]);
        setCurrentMarkers(prev => [...prev, { type: 'via', marker }]);

        // 지도 중심 이동
        map.setCenter(new window.Tmapv2.LatLng(locationData.lat, locationData.lon));
        map.setZoom(16);
      }
    };

    addPlaceMarker();
  };

  // 경유지 제거
  const handleRemovePlace = (place) => {
    // viaPoints에서 제거
    setViaPoints(prev => prev.filter(p => p.name !== place.title));

    // 해당 장소의 마커 찾아서 제거
    const markerToRemove = currentMarkers.find(m =>
      m.type === 'via' && m.marker.getPosition().lat() === parseFloat(place.mapy) &&
      m.marker.getPosition().lng() === parseFloat(place.mapx)
    );

    if (markerToRemove) {
      markerToRemove.marker.setMap(null);
      setCurrentMarkers(prev => prev.filter(m => m !== markerToRemove));
    }
  };

  return (
    <ScheduleUI
      mapRef={mapRef}
      keyword={keyword}
      setKeyword={setKeyword}
      searchType={searchType}
      setSearchType={setSearchType}
      pathType={pathType}
      setPathType={setPathType}
      handleSearch={handleSearch}
      results={results}
      handleSelectLocation={handleSelectLocation}
      startPoint={startPoint}
      endPoint={endPoint}
      viaPoints={viaPoints}
      routeResult={routeResult}
      transitDetails={transitDetails}
      routeDetails={routeDetails}
      handleAddPlace={handleAddPlace}
      handleRemovePlace={handleRemovePlace}
      drawDayRoute={drawDayRoute}
      handleDaySelect={handleDaySelect}
      clearAllRoutes={clearAllRoutes}
    />
  );
};

export default ScheduleTmap;
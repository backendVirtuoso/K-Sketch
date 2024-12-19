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

  // 도로명 주소 포맷팅
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

  // 통합된 경로 검색 함수
  const searchRoute = async () => {
    // 경유지가 없는 경우 검색 중단
    if (viaPoints.length === 0) {
      alert('최소 한 개 이상의 장소를 선택해주세요.');
      return;
    }

    // 기존 경로 삭제
    currentPolylines.forEach(polyline => {
      if (polyline) polyline.setMap(null);
    });
    setCurrentPolylines([]);

    const headers = {
      'Content-Type': 'application/json',
      'appKey': process.env.REACT_APP_TMAP_KEY
    };

    try {
      let url, requestBody;

      // 출발지와 도착지 설정
      const effectiveStartPoint = startPoint || viaPoints[0];
      const effectiveEndPoint = endPoint || viaPoints[viaPoints.length - 1];
      // 중간 경유지들 (출발지와 도착지를 제외한 나머지 포인트들)
      const middleViaPoints = viaPoints.slice(
        startPoint ? 0 : 1,
        endPoint ? viaPoints.length : viaPoints.length - 1
      );

      if (pathType === 'transit') {
        // 대중교통 경로 요청 처리
        const points = [effectiveStartPoint, ...middleViaPoints, effectiveEndPoint];
        const legs = [];

        // 연속된 두 지점 간의 경로를 각각 요청
        for (let i = 0; i < points.length - 1; i++) {
          const start = points[i];
          const end = points[i + 1];

          url = 'https://apis.openapi.sk.com/transit/routes';
          requestBody = {
            startX: start.lon.toString(),
            startY: start.lat.toString(),
            endX: end.lon.toString(),
            endY: end.lat.toString(),
            format: 'json',
            count: 1
          };

          const transitResponse = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });

          const transitData = await transitResponse.json();

          if (transitData.metaData?.plans?.[0]?.itineraries?.[0]) {
            const itinerary = transitData.metaData.plans[0].itineraries[0];
            if (!itinerary.legs) {
              itinerary.legs = [];
            }
            const enhancedLegs = itinerary.legs.map(leg => ({
              mode: leg.mode || 'WALK',
              sectionTime: leg.sectionTime || 0,
              distance: leg.distance || 0,
              start: leg.start || { name: start.name, lat: start.lat, lon: start.lon },
              end: leg.end || { name: end.name, lat: end.lat, lon: end.lon },
              route: leg.route || null,
              passShape: leg.passShape || { linestring: '' }
            }));
            itinerary.legs = enhancedLegs;
            legs.push(itinerary);
          }
        }

        const combinedRoute = {
          metaData: {
            plan: {
              itineraries: [{
                legs: legs.flatMap(itinerary => itinerary.legs),
                totalDistance: legs.reduce((sum, itinerary) =>
                  sum + (itinerary.totalDistance || 0), 0),
                totalTime: legs.reduce((sum, itinerary) =>
                  sum + (itinerary.totalTime || 0), 0),
                transferCount: legs.reduce((sum, itinerary) =>
                  sum + (itinerary.transferCount || 0), 0)
              }]
            }
          }
        };

        // drawRoute(combinedRoute);
        drawDayRoute(combinedRoute, 0);
      } else {
        // 자동차 경로 처리
        url = 'https://apis.openapi.sk.com/tmap/routes/routeOptimization20?version=1&format=json';

        requestBody = {
          startName: encodeURIComponent('출발지'),
          startX: effectiveStartPoint.lon.toString(),
          startY: effectiveStartPoint.lat.toString(),
          startTime: "202402291200",
          endName: encodeURIComponent('도착지'),
          endX: effectiveEndPoint.lon.toString(),
          endY: effectiveEndPoint.lat.toString(),
          reqCoordType: 'WGS84GEO',
          resCoordType: 'WGS84GEO',
          searchOption: '0',
          viaPoints: middleViaPoints.map((point, index) => ({
            viaPointId: `via${index + 1}`,
            viaPointName: encodeURIComponent(`경유지${index + 1}`),
            viaX: point.lon.toString(),
            viaY: point.lat.toString()
          }))
        };

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('API 오류:', errorData);
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        drawRoute(data);
      }
    } catch (error) {
      console.error('경로 검색 오류:', error);
      alert('경로 검색 중 오류가 발생했습니다.');
    }
  };

  // 통합된 경로 그리기 함수
  const drawRoute = (routeData, dayIndex) => {
    const newPolylines = [];
    const bounds = new window.Tmapv2.LatLngBounds();
    let hasValidCoordinates = false;

    if (pathType === 'transit') {
      // 대중교통 경로 그리기
      const itinerary = routeData.metaData?.plan?.itineraries?.[0];

      if (!itinerary) {
        console.error('유효한 경로 데이터가 없습니다.');
        return;
      }

      // 경로 정보 설정
      const tDistance = `총 거리: ${((itinerary.totalDistance || 0) / 1000).toFixed(1)}km`;
      const tTime = `총 시간: ${Math.round((itinerary.totalTime || 0) / 60)}분`;
      const tTransfer = `환승: ${itinerary.transferCount || 0}회`;
      setRouteResult(`${tDistance}, ${tTime}, ${tTransfer}`);

      // 상세 정보 설정
      const details = itinerary.legs?.map(leg => ({
        mode: leg.mode || 'WALK',
        sectionTime: Math.round((leg.sectionTime || 0) / 60),
        distance: ((leg.distance || 0) / 1000).toFixed(1),
        start: leg.start?.name || '알 수 없음',
        end: leg.end?.name || '알 수 없음',
        routeName: leg.route?.name,
        routeNumber: leg.route?.name
      })) || [];
      setTransitDetails(details);

      // 경로 그리기
      itinerary.legs?.forEach(leg => {
        if (leg.passShape?.linestring) {
          let coordinates;
          try {
            if (typeof leg.passShape.linestring === 'string') {
              coordinates = leg.passShape.linestring
                .split(' ')
                .map(coord => {
                  const [lon, lat] = coord.split(',').map(Number);
                  if (isNaN(lat) || isNaN(lon)) return null;
                  return new window.Tmapv2.LatLng(lat, lon);
                })
                .filter(coord => coord !== null);
            } else if (Array.isArray(leg.passShape.linestring)) {
              coordinates = leg.passShape.linestring
                .map(coord => {
                  if (!Array.isArray(coord) || coord.length !== 2) return null;
                  const [lon, lat] = coord;
                  if (isNaN(lat) || isNaN(lon)) return null;
                  return new window.Tmapv2.LatLng(lat, lon);
                })
                .filter(coord => coord !== null);
            }

            if (coordinates && coordinates.length > 0) {
              hasValidCoordinates = true;
              coordinates.forEach(coord => bounds.extend(coord));

              const polyline = new window.Tmapv2.Polyline({
                path: coordinates,
                strokeColor: dayIndex !== undefined ? DAY_COLORS[dayIndex] :
                  (leg.mode === 'WALK' ? "#00ff00" : leg.mode === 'BUS' ? "#ff0000" : "#0000ff"),
                strokeWeight: 6,
                map: map
              });

              newPolylines.push(polyline);
            }
          } catch (error) {
            console.error('경로 좌표 처리 중 오류:', error);
          }
        }
      });
    } else {
      // 자동차 경로 그리기
      if (!routeData.features || routeData.features.length === 0) {
        alert('유효한 경로를 찾을 수 없습니다.');
        return;
      }

      // 경로 정보 설정
      const totalDistance = (routeData.properties.totalDistance / 1000).toFixed(1);
      const totalTime = Math.round(routeData.properties.totalTime / 60);
      setRouteResult(`총 거리: ${totalDistance}km, 총 시간: ${totalTime}분`);

      // 경로 상세 정보 설정
      setRouteDetails(routeData);

      // 경로 그리기
      routeData.features.forEach(feature => {
        if (feature.geometry.type === 'LineString') {
          const coordinates = feature.geometry.coordinates.map(coord => {
            const latLng = new window.Tmapv2.LatLng(coord[1], coord[0]);
            bounds.extend(latLng);
            return latLng;
          });

          const polyline = new window.Tmapv2.Polyline({
            path: coordinates,
            strokeColor: DAY_COLORS[dayIndex],
            strokeWeight: 6,
            strokeStyle: 'solid',
            map: map
          });

          newPolylines.push(polyline);
        }
      });
    }

    // 유효한 좌표가 있을 때만 지도 범위 조정
    if (hasValidCoordinates) {
      map.fitBounds(bounds);
    } else {
      // 유효한 경로가 없을 경우 시작점과 도착점을 기준으로 지도 범위 조정
      const defaultBounds = new window.Tmapv2.LatLngBounds();
      if (startPoint) {
        defaultBounds.extend(new window.Tmapv2.LatLng(startPoint.lat, startPoint.lon));
      }
      if (endPoint) {
        defaultBounds.extend(new window.Tmapv2.LatLng(endPoint.lat, endPoint.lon));
      }
      viaPoints.forEach(point => {
        defaultBounds.extend(new window.Tmapv2.LatLng(point.lat, point.lon));
      });
      map.fitBounds(defaultBounds);
    }

    setCurrentPolylines(newPolylines);
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

  // 경로 초기화 함수 추가
  const clearAllRoutes = () => {
    // 모든 마커 제거
    currentMarkers.forEach(marker => {
      if (marker.marker) marker.marker.setMap(null);
    });
    setCurrentMarkers([]);

    // 모든 경로선 제거
    currentPolylines.forEach(polyline => {
      if (polyline) polyline.setMap(null);
    });
    setCurrentPolylines([]);

    // 저장된 경로 데이터 초기화
    setDayRoutes({});
    setSelectedDayIndex(null);
  };

  // 일자별 경로 그리기 함수 수정
  const drawDayRoute = async (dayPlaces, dayIndex) => {
    // 기존 경로 초기화
    clearAllRoutes();

    const newPolylines = [];
    const bounds = new window.Tmapv2.LatLngBounds();

    try {
      // 해당 일자의 장소들로 경로 생성
      for (let i = 0; i < dayPlaces.length - 1; i++) {
        const start = dayPlaces[i];
        const end = dayPlaces[i + 1];

        const url = 'https://apis.openapi.sk.com/tmap/routes?version=1';
        const headers = {
          'Content-Type': 'application/json',
          'appKey': process.env.REACT_APP_TMAP_KEY
        };

        const requestBody = {
          startX: start.longitude.toString(),
          startY: start.latitude.toString(),
          endX: end.longitude.toString(),
          endY: end.latitude.toString(),
          reqCoordType: 'WGS84GEO',
          resCoordType: 'WGS84GEO'
        };

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data = await response.json();

        if (data.features) {
          data.features.forEach(feature => {
            if (feature.geometry.type === 'LineString') {
              const coordinates = feature.geometry.coordinates.map(coord => {
                const latLng = new window.Tmapv2.LatLng(coord[1], coord[0]);
                bounds.extend(latLng);
                return latLng;
              });

              const polyline = new window.Tmapv2.Polyline({
                path: coordinates,
                strokeColor: DAY_COLORS[dayIndex % DAY_COLORS.length], // 일자별 색상 적용
                strokeWeight: 6,
                map: map
              });

              newPolylines.push(polyline);
            }
          });
        }
      }

      // 마커 생성
      dayPlaces.forEach((place, index) => {
        const marker = new window.Tmapv2.Marker({
          position: new window.Tmapv2.LatLng(place.latitude, place.longitude),
          icon: `https://tmapapi.tmapmobility.com/upload/tmap/marker/pin_b_m_${index + 1}.png`,
          iconSize: new window.Tmapv2.Size(24, 38),
          map: map
        });
        setCurrentMarkers(prev => [...prev, { type: 'place', marker }]);
      });

      // 경로 저장
      setDayRoutes(prev => ({
        ...prev,
        [dayIndex]: {
          polylines: newPolylines,
          places: dayPlaces
        }
      }));

      // 지도 범위 조정
      if (bounds.hasValidBounds()) {
        map.fitBounds(bounds);
      }

      setSelectedDayIndex(dayIndex);
      setCurrentPolylines(newPolylines);

    } catch (error) {
      console.error('경로 그리기 오류:', error);
      alert('경로를 그리는 중 오류가 발생했습니다.');
    }
  };

  // 일자 선택 시 해당 경로 표시
  const handleDaySelect = (dayIndex) => {
    // 기존 경로 초기화
    clearAllRoutes();

    // 선택된 일자의 경로와 마커 표시
    if (dayRoutes[dayIndex]) {
      const { polylines, places } = dayRoutes[dayIndex];

      // 경로 표시
      polylines.forEach(polyline => {
        polyline.setMap(map);
      });
      setCurrentPolylines(polylines);

      // 마커 표시
      places.forEach((place, index) => {
        const marker = new window.Tmapv2.Marker({
          position: new window.Tmapv2.LatLng(place.latitude, place.longitude),
          icon: `https://tmapapi.tmapmobility.com/upload/tmap/marker/pin_b_m_${index + 1}.png`,
          iconSize: new window.Tmapv2.Size(24, 38),
          map: map
        });
        setCurrentMarkers(prev => [...prev, { type: 'place', marker }]);
      });
    }
    setSelectedDayIndex(dayIndex);
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
      searchRoute={searchRoute}
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
    />
  );
};

export default ScheduleTmap;
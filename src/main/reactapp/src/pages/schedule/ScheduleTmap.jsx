import React, {useEffect, useRef, useState} from 'react';
import ScheduleUI from './ScheduleUI';

const ScheduleTmap = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('start');
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [pathType, setPathType] = useState('pedestrian');
  const [routeResult, setRouteResult] = useState('');
  const [currentMarkers, setCurrentMarkers] = useState([]);
  const [currentPolylines, setCurrentPolylines] = useState([]);
  const [transitDetails, setTransitDetails] = useState(null);
  const [viaPoints, setViaPoints] = useState([]);
  const [routeDetails, setRouteDetails] = useState(null);
  const [routeMatrix, setRouteMatrix] = useState([]);

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
      appKey: '9qADilut4013qYvrfS0KO8JdHxQWM3kW5NlS6hY5'
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

    const marker = new window.Tmapv2.Marker({
      position: new window.Tmapv2.LatLng(point.lat, point.lon),
      icon: searchType === 'start'
        ? 'https://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_s.png'
        : searchType === 'end'
          ? 'https://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_e.png'
          : 'https://tmapapi.tmapmobility.com/upload/tmap/marker/pin_b_m_p.png',
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

  // 대중교통 경로 사이의 도보 경로를 찾는 함수
  const findWalkingPath = async (start, end) => {
    const headers = {
      'Content-Type': 'application/json',
      'appKey': '9qADilut4013qYvrfS0KO8JdHxQWM3kW5NlS6hY5'
    };

    try {
      const response = await fetch('https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            startX: start.lon.toString(),
            startY: start.lat.toString(),
            endX: end.lon.toString(),
            endY: end.lat.toString(),
            reqCoordType: 'WGS84GEO',
            resCoordType: 'WGS84GEO',
            startName: encodeURIComponent('출발'),
            endName: encodeURIComponent('도착')
          })
        }
      );
      return await response.json();
    } catch (error) {
      console.error('도보 경로 검색 오류:', error);
      return null;
    }
  };

  // 통합된 경로 검색 함수
  const searchRoute = async () => {
    if (!startPoint || !endPoint) {
      alert('출발지와 도착지를 모두 선택해주세요.');
      return;
    }

    // 기존 경로 삭제
    currentPolylines.forEach(polyline => {
      if (polyline) polyline.setMap(null);
    });
    setCurrentPolylines([]);

    const headers = {
      'Content-Type': 'application/json',
      'appKey': '9qADilut4013qYvrfS0KO8JdHxQWM3kW5NlS6hY5'
    };

    try {
      let url, requestBody;

      if (pathType === 'transit') {
        // 대중교통 경로 요청을 경유지 개수만큼 나누어 처리
        const points = [startPoint, ...viaPoints, endPoint];
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

          // 대중교통 경로 요청
          const transitResponse = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });

          const transitData = await transitResponse.json();
          
          // 응답 데이터 구조 확인 및 수정
          if (transitData.metaData?.plans?.[0]?.itineraries?.[0]) {
            const itinerary = transitData.metaData.plans[0].itineraries[0];
            
            // legs 배열이 없는 경우 빈 배열로 초기화
            if (!itinerary.legs) {
              itinerary.legs = [];
            }

            // 각 leg의 필수 속성 확인 및 기본값 설정
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

        // 모든 경로 데이터 통합
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

        drawRoute(combinedRoute);
      } else {
        // 보행자/자동차 경로 처리 (기존 코드)
        url = pathType === 'pedestrian'
          ? 'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json'
          : 'https://apis.openapi.sk.com/tmap/routes?version=1&format=json';
        
        requestBody = {
          startX: startPoint.lon.toString(),
          startY: startPoint.lat.toString(),
          endX: endPoint.lon.toString(),
          endY: endPoint.lat.toString(),
          reqCoordType: 'WGS84GEO',
          resCoordType: 'WGS84GEO',
          startName: encodeURIComponent('출발지'),
          endName: encodeURIComponent('도착지'),
          searchOption: pathType === 'pedestrian' ? '10' : '0'
        };

        if (viaPoints.length > 0) {
          requestBody.passList = viaPoints
            .map(point => `${point.lon},${point.lat}`)
            .join('_');
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        drawRoute(data);
      }
    } catch (error) {
      console.error('경로 검색 오류:', error);
      alert('경로 검색 중 오류가 발생했습니다.');
    }
  };

  // 통합된 경로 그리기 함수
  const drawRoute = (routeData) => {
    const newPolylines = [];
    const bounds = new window.Tmapv2.LatLngBounds();

    if (pathType === 'transit') {
      // 대중교통 경로 그리기
      const itinerary = routeData.metaData.plan.itineraries[0];
      
      // 경로 정보 설정
      const tDistance = `총 거리: ${(itinerary.totalDistance / 1000).toFixed(1)}km`;
      const tTime = `총 시간: ${Math.round(itinerary.totalTime / 60)}분`;
      const tTransfer = `환승: ${itinerary.transferCount}회`;
      setRouteResult(`${tDistance}, ${tTime}, ${tTransfer}`);

      // 상세 정보 설정
      const details = itinerary.legs.map(leg => ({
        mode: leg.mode,
        sectionTime: Math.round(leg.sectionTime / 60),
        distance: (leg.distance / 1000).toFixed(1),
        start: leg.start.name,
        end: leg.end.name,
        routeName: leg.route?.name,
        routeNumber: leg.route?.name
      }));
      setTransitDetails(details);

      // 경로 그리기
      itinerary.legs.forEach(leg => {
        if (leg.passShape) {
          let coordinates;
          if (leg.mode === 'WALK' && Array.isArray(leg.passShape.linestring)) {
            // 도보 경로가 좌표 배열로 들어온 경우
            coordinates = leg.passShape.linestring.map(coord => 
              new window.Tmapv2.LatLng(coord[1], coord[0])
            );
          } else {
            // 기존 문자열 형식의 경로
            coordinates = leg.passShape.linestring
              .split(' ')
              .map(coord => {
                const [lon, lat] = coord.split(',');
                return new window.Tmapv2.LatLng(parseFloat(lat), parseFloat(lon));
              });
          }

          coordinates.forEach(coord => bounds.extend(coord));

          const polyline = new window.Tmapv2.Polyline({
            path: coordinates,
            strokeColor: leg.mode === 'WALK' ? "#00ff00" : leg.mode === 'BUS' ? "#ff0000" : "#0000ff",
            strokeWeight: 6,
            map: map
          });

          newPolylines.push(polyline);
        }
      });

    } else {
      // 보행자/자동차 경로 그리기
      if (!routeData.features || routeData.features.length === 0) {
        alert('유효한 경로를 찾을 수 없습니다.');
        return;
      }

      // 경로 정보 설정
      const totalDistance = (routeData.features[0].properties.totalDistance / 1000).toFixed(1);
      const totalTime = Math.round(routeData.features[0].properties.totalTime / 60);
      setRouteResult(`총 거리: ${totalDistance}km, 총 시간: ${totalTime}분`);

      // 보행자/자동차 경로 상세 정보 설정
      setRouteDetails(routeData);

      // 경로 그리기
      routeData.features.forEach(feature => {
        if (feature.geometry.type === 'LineString') {
          const coordinates = feature.geometry.coordinates.map(coord => {
            const latLng = new window.Tmapv2.LatLng(coord[1], coord[0]);
            bounds.extend(latLng);
            return latLng;
          });

          let strokeColor, strokeWeight;
          
          if (pathType === 'pedestrian') {
            strokeColor = "#00FF00";
            strokeWeight = 6;
          } else {
            // 자동차 경로에서 도보 구간 구분
            if (feature.properties.turnType === 211 || // 계단
                feature.properties.turnType === 212 || // 지하보도
                feature.properties.turnType === 213 || // 육교
                feature.properties.turnType === 214 || // 도보
                feature.properties.turnType === 215) { // 광장
              strokeColor = "#00FF00";
              strokeWeight = 6;
            } else {
              strokeColor = "#FF0000";
              strokeWeight = 6;
            }
          }

          const polyline = new window.Tmapv2.Polyline({
            path: coordinates,
            strokeColor: strokeColor,
            strokeWeight: strokeWeight,
            strokeStyle: 'solid',
            map: map
          });

          newPolylines.push(polyline);
        }
      });
    }

    // 모든 경로가 보이도록 지도 범위 조정
    map.fitBounds(bounds);
    setCurrentPolylines(newPolylines);
  };

  // 새로운 장소 추가 (경유지로)
  const handleAddPlace = (place) => {
    // POI 검색으로 위경도 조회
    const searchPOI = async (keyword) => {
      const headers = {
        appKey: '9qADilut4013qYvrfS0KO8JdHxQWM3kW5NlS6hY5'
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

  // 경유지 최적화 함수
  const optimizeViaPoints = async () => {
    if (!startPoint || !endPoint || viaPoints.length === 0) {
      alert('출발지, 도착지, 경유지를 모두 설정해주세요.');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'appKey': '9qADilut4013qYvrfS0KO8JdHxQWM3kW5NlS6hY5'
    };

    try {
      const requestBody = {
        startName: "출발지",
        startX: startPoint.lon.toString(),
        startY: startPoint.lat.toString(),
        endName: "도착지",
        endX: endPoint.lon.toString(),
        endY: endPoint.lat.toString(),
        viaPoints: viaPoints.map((point, index) => ({
          viaPointId: `via${index + 1}`,
          viaPointName: point.name || `경유지${index + 1}`,
          viaX: point.lon.toString(),
          viaY: point.lat.toString()
        }))
      };

      const response = await fetch(
        'https://apis.openapi.sk.com/tmap/routes/routeOptimization?version=1',
        {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();
      
      // 최적화된 경유지 순서로 재정렬
      if (data.properties && data.features) {
        const optimizedViaPoints = data.features
          .filter(feature => feature.properties.viaPointId)
          .map(feature => {
            return viaPoints.find(p =>
                p.lon.toString() === feature.geometry.coordinates[0].toString() &&
                p.lat.toString() === feature.geometry.coordinates[1].toString()
            );
          });

        setViaPoints(optimizedViaPoints);
        // 최적화된 경로로 다시 검색
        searchRoute();
      }
    } catch (error) {
      console.error('경유지 최적화 오류:', error);
      alert('경유지 최적화 중 오류가 발생했습니다.');
    }
  };

  // 경로 매트릭스 함수
  const calculateRouteMatrix = async () => {
    if (!startPoint || !endPoint || viaPoints.length === 0) {
      alert('출발지, 도착지, 경유지를 모두 설정해주세요.');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'appKey': '9qADilut4013qYvrfS0KO8JdHxQWM3kW5NlS6hY5'
    };

    try {
      const origins = [startPoint, ...viaPoints];
      const destinations = [...viaPoints, endPoint];

      const requestBody = {
        origins: origins.map(point => ({
          lon: point.lon.toString(),
          lat: point.lat.toString()
        })),
        destinations: destinations.map(point => ({
          lon: point.lon.toString(),
          lat: point.lat.toString()
        }))
      };

      const response = await fetch(
        'https://apis.openapi.sk.com/tmap/matrix?version=1',
        {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();
      
      // 매트릭스 결과 처리
      if (data.matrixRoutes) {
        const matrixInfo = data.matrixRoutes.map(route => ({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60)
        }));
        
        // 매트릭스 결과를 상태로 저장하거나 표시
        setRouteMatrix(matrixInfo);
      }
    } catch (error) {
      console.error('경로 매트릭스 오류:', error);
      alert('경로 매트릭스 계산 중 오류가 발생했습니다.');
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
      optimizeViaPoints={optimizeViaPoints}
      calculateRouteMatrix={calculateRouteMatrix}
      routeMatrix={routeMatrix}
    />
  );
};

export default ScheduleTmap;
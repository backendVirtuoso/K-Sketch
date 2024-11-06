import React, { useState, useEffect, useRef } from 'react';

const TmapPath = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('start'); // 'start' 또는 'end'
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [pathType, setPathType] = useState('pedestrian'); // 'pedestrian', 'car', 'transit'
  const [routeResult, setRouteResult] = useState('');
  const [currentPolyline, setCurrentPolyline] = useState(null);
  const [currentMarkers, setCurrentMarkers] = useState([]);
  const [searchMode, setSearchMode] = useState('address'); // 'address' 또는 'poi'
  const [currentPolylines, setCurrentPolylines] = useState([]);
  const [transitDetails, setTransitDetails] = useState(null);

  // 지도 초기화
  useEffect(() => {
    const initTmap = () => {
      const mapDiv = mapRef.current;
      if (!mapDiv.firstChild) {
        const tmap = new window.Tmapv2.Map('map_div', {
          center: new window.Tmapv2.LatLng(37.49241689559544, 127.03171389453507),
          width: '100%',
          height: '600px',
          zoom: 11,
          zoomControl: true,
          scrollwheel: true,
        });
        setMap(tmap);
      }
    };
    initTmap();
  }, []);

  // 주소 검색 함수
  const handleAddressSearch = async () => {
    if (keyword.trim() === '') {
      alert('검색어를 입력해주세요.');
      return;
    }

    const url = 'https://apis.openapi.sk.com/tmap/geo/postcode';
    const headers = {
      appKey: '9qADilut4013qYvrfS0KO8JdHxQWM3kW5NlS6hY5'
    };

    const params = {
      coordType: 'WGS84GEO',
      addressFlag: 'F00',
      format: 'json',
      page: 1,
      count: 10,
      addr: keyword
    };

    try {
      const response = await fetch(`${url}?${new URLSearchParams(params)}`, { headers });
      const data = await response.json();

      if (data.error || data.coordinateInfo.coordinate.length <= 0) {
        setResults([]);
        return;
      }

      const formattedResults = data.coordinateInfo.coordinate.map(item => ({
        lat: item.lat,
        lon: item.lon,
        name: formatRoadAddress(item),
        type: 'address',
        rawData: item
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error('Error fetching address data:', error);
    }
  };

  // 주소 포맷팅 함수
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

  // POI 검색 함수
  const handlePOISearch = async () => {
    if (keyword.trim() === '') {
      alert('검색어를 입력해주세요.');
      return;
    }

    const url = 'https://apis.openapi.sk.com/tmap/pois';
    const headers = {
      appKey: '9qADilut4013qYvrfS0KO8JdHxQWM3kW5NlS6hY5'
    };

    const params = {
      version: 1,
      format: 'json',
      searchKeyword: keyword,
      resCoordType: 'WGS84GEO',
      reqCoordType: 'WGS84GEO',
      count: 10
    };

    try {
      const response = await fetch(`${url}?${new URLSearchParams(params)}`, { headers });
      const data = await response.json();

      if (!data.searchPoiInfo.pois.poi) {
        setResults([]);
        return;
      }

      const formattedResults = data.searchPoiInfo.pois.poi.map(item => ({
        lat: item.noorLat,
        lon: item.noorLon,
        name: item.name,
        address: item.upperAddrName + ' ' + item.middleAddrName + ' ' + item.lowerAddrName,
        type: 'poi'
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error('Error fetching POI data:', error);
    }
  };

  // 통합 검색 핸들러
  const handleSearch = () => {
    if (searchMode === 'address') {
      handleAddressSearch();
    } else {
      handlePOISearch();
    }
  };

  // 위치 선택 처리 함수
  const handleSelectLocation = (location) => {
    const point = {
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      address: location.type === 'address' ? location.name : location.address,
      name: location.name
    };

    // 마커 생성 및 관리
    const marker = new window.Tmapv2.Marker({
      position: new window.Tmapv2.LatLng(point.lat, point.lon),
      icon: searchType === 'start'
        ? 'https://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_s.png'
        : 'https://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_e.png',
      iconSize: new window.Tmapv2.Size(24, 38),
      map: map
    });

    // 기존 마커 제거
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

    setCurrentMarkers(prev => [
      ...prev.filter(m => m.type !== searchType),
      { type: searchType, marker }
    ]);

    setResults([]);
    setKeyword('');
  };

  // 경로 검색 함수
  const searchRoute = async () => {
    if (pathType === 'transit') {
      searchTransitRoute();
    } else {
      if (!startPoint || !endPoint) {
        alert('출발지와 도착지를 모두 선택해주세요.');
        return;
      }

      if (currentPolyline) {
        currentPolyline.setMap(null);
      }

      const headers = {
        'Content-Type': 'application/json',
        'appKey': '9qADilut4013qYvrfS0KO8JdHxQWM3kW5NlS6hY5'
      };

      const url = pathType === 'pedestrian'
        ? 'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json'
        : 'https://apis.openapi.sk.com/tmap/routes?version=1&format=json';

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            startX: startPoint.lon.toString(),
            startY: startPoint.lat.toString(),
            endX: endPoint.lon.toString(),
            endY: endPoint.lat.toString(),
            reqCoordType: 'WGS84GEO',
            resCoordType: 'WGS84GEO',
            startName: '출발지',
            endName: '도착지'
          })
        });

        const data = await response.json();
        drawRoute(data);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // 경로 그리기 함수
  const drawRoute = (routeData) => {
    const resultData = routeData.features;
    const tDistance = `총 거리: ${(resultData[0].properties.totalDistance / 1000).toFixed(1)}km`;
    const tTime = `총 시간: ${(resultData[0].properties.totalTime / 60).toFixed(0)}분`;
    setRouteResult(`${tDistance}, ${tTime}`);

    const lineArray = [];
    resultData.forEach(feature => {
      if (feature.geometry.type === "LineString") {
        feature.geometry.coordinates.forEach(coord => {
          lineArray.push(new window.Tmapv2.LatLng(coord[1], coord[0]));
        });
      }
    });

    const polyline = new window.Tmapv2.Polyline({
      path: lineArray,
      strokeColor: "#FF0000",
      strokeWeight: 6,
      map: map
    });

    setCurrentPolyline(polyline);

    const bounds = new window.Tmapv2.LatLngBounds();
    lineArray.forEach(point => bounds.extend(point));
    map.fitBounds(bounds);
  };

  // 대중교통 경로 검색 함수 추가
  const searchTransitRoute = async () => {
    if (!startPoint || !endPoint) {
      alert('출발지와 도착지를 모두 선택해주요.');
      return;
    }

    if (currentPolyline) {
      currentPolyline.setMap(null);
    }

    const url = 'https://apis.openapi.sk.com/transit/routes';
    const headers = {
      'Content-Type': 'application/json',
      'appKey': '9qADilut4013qYvrfS0KO8JdHxQWM3kW5NlS6hY5'
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          startX: startPoint.lon.toString(),
          startY: startPoint.lat.toString(),
          endX: endPoint.lon.toString(),
          endY: endPoint.lat.toString(),
          format: 'json',
          count: 1
        })
      });

      const data = await response.json();
      drawTransitRoute(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 대중교통 경로 그리기 함수 추가
  const drawTransitRoute = (routeData) => {
    const itinerary = routeData.metaData.plan.itineraries[0];

    // 기존 polyline 제거
    currentPolylines.forEach(polyline => {
      if (polyline && polyline.setMap) {
        polyline.setMap(null);
      }
    });
    setCurrentPolylines([]);

    const newPolylines = [];

    // 전체 경로 정보 표시
    const tDistance = `총 거리: ${(itinerary.totalDistance / 1000).toFixed(1)}km`;
    const tTime = `총 시간: ${Math.round(itinerary.totalTime / 60)}분`;
    const tTransfer = `환승: ${itinerary.transferCount}회`;
    setRouteResult(`${tDistance}, ${tTime}, ${tTransfer}`);

    // 상세 경로 정보 저장
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
        const linestring = leg.passShape.linestring;
        const coordinates = linestring.split(' ').map(coord => {
          const [lon, lat] = coord.split(',');
          return new window.Tmapv2.LatLng(parseFloat(lat), parseFloat(lon));
        });

        const polyline = new window.Tmapv2.Polyline({
          path: coordinates,
          strokeColor: leg.mode === 'BUS' ? "#ff0000" : "#0000ff",
          strokeWeight: 6,
          map: map
        });

        newPolylines.push(polyline);
      }
    });

    setCurrentPolylines(newPolylines);

    // 지도 범위 조정
    const bounds = new window.Tmapv2.LatLngBounds();
    itinerary.legs.forEach(leg => {
      bounds.extend(new window.Tmapv2.LatLng(leg.start.lat, leg.start.lon));
      bounds.extend(new window.Tmapv2.LatLng(leg.end.lat, leg.end.lon));
    });
    map.fitBounds(bounds);
  };

  return (
    <main className="flex-shrink-0 bg-light">
      <section className="py-3">
        <div className="container px-4">
          <div className="row">
            {/* 전체 너비 사용 */}
            <div className="col-12">
              {/* 검색 영역 - 30% 높이 */}
              <div className="card shadow-sm mb-3" style={{ height: '30vh', minHeight: '250px' }}>
                <div className="card-body">
                  <div className="row h-100">
                    {/* 왼쪽 영역 - 검색 버튼들 */}
                    <div className="col-md-4 mb-3 mb-md-0">
                      {/* 검색 타입 버튼 */}
                      <div className="btn-group w-100 mb-2">
                        <button
                          onClick={() => setSearchType('start')}
                          className={`btn btn-sm ${searchType === 'start' ? 'btn-primary' : 'btn-outline-primary'}`}
                        >
                          <i className="bi bi-geo-alt-fill me-1"></i>출발
                        </button>
                        <button
                          onClick={() => setSearchType('end')}
                          className={`btn btn-sm ${searchType === 'end' ? 'btn-primary' : 'btn-outline-primary'}`}
                        >
                          <i className="bi bi-geo-alt me-1"></i>도착
                        </button>
                      </div>

                      {/* 검색 모드 버튼 */}
                      <div className="btn-group w-100 mb-2">
                        <button
                          onClick={() => setSearchMode('address')}
                          className={`btn btn-sm ${searchMode === 'address' ? 'btn-success' : 'btn-outline-success'}`}
                        >
                          <i className="bi bi-house me-1"></i>주소
                        </button>
                        <button
                          onClick={() => setSearchMode('poi')}
                          className={`btn btn-sm ${searchMode === 'poi' ? 'btn-success' : 'btn-outline-success'}`}
                        >
                          <i className="bi bi-search me-1"></i>장소
                        </button>
                      </div>

                      {/* 경로 옵션 */}
                      <div className="d-flex gap-1">
                        <select
                          className="form-select form-select-sm"
                          value={pathType}
                          onChange={(e) => setPathType(e.target.value)}
                        >
                          <option value="pedestrian">보행자</option>
                          <option value="car">자동차</option>
                          <option value="transit">대중교통</option>
                        </select>
                        <button className="btn btn-primary btn-sm" onClick={searchRoute}>
                          <i className="bi bi-signpost-2"></i>
                        </button>
                      </div>
                    </div>

                    {/* 중앙 영역 - 검색창과 결과 */}
                    <div className="col-md-5 mb-3 mb-md-0">
                      {/* 검색창 */}
                      <div className="input-group input-group-sm mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          placeholder={searchMode === 'address' ? "주소 검색" : "장소 검색"}
                        />
                        <button className="btn btn-primary" onClick={handleSearch}>
                          <i className="bi bi-search"></i>
                        </button>
                      </div>

                      {/* 검색 결과 */}
                      <div className="search-results-container">
                        {results.length > 0 && (
                          <div className="list-group list-group-flush">
                            {results.map((result, index) => (
                              <button
                                key={index}
                                className="list-group-item list-group-item-action py-1 small"
                                onClick={() => handleSelectLocation(result)}
                              >
                                <div className="fw-bold">{result.name}</div>
                                {result.type === 'poi' && (
                                  <small className="text-muted">{result.address}</small>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 오른쪽 영역 - 선택된 위치 */}
                    <div className="col-md-3">
                      <div className="bg-light p-2 rounded h-100">
                        <div className="small mb-2">
                          <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                          <span className="fw-bold">출발:</span>
                          <div className="text-truncate">{startPoint?.name || '선택되지 않음'}</div>
                        </div>
                        <div className="small">
                          <i className="bi bi-geo-alt text-primary me-1"></i>
                          <span className="fw-bold">도착:</span>
                          <div className="text-truncate">{endPoint?.name || '선택되지 않음'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 지도 영역 - 70% 높이 */}
              <div className="card shadow-sm" style={{ height: '60vh', minHeight: '400px' }}>
                <div className="card-body p-0">
                  <div id="map_div" ref={mapRef} className="rounded h-100"></div>
                  {/* 경로 결과 */}
                  {routeResult && (
                    <div className="alert alert-info m-2 py-1 small position-absolute bottom-0 start-50 translate-middle-x">
                      <i className="bi bi-info-circle me-1"></i>{routeResult}
                    </div>
                  )}
                </div>
              </div>

              {/* 대중교통 상세 정보 영역 추가 */}
              {transitDetails && pathType === 'transit' && (
                <div className="card shadow-sm mt-3">
                  <div className="card-body">
                    <h6 className="card-title">경로 상세 정보</h6>
                    <div className="transit-details">
                      {transitDetails.map((detail, index) => (
                        <div key={index} className="transit-step mb-3">
                          {detail.mode === 'WALK' ? (
                            <div className="d-flex align-items-center">
                              <i className="bi bi-person-walking me-2"></i>
                              <div>
                                <div>도보 {detail.sectionTime}분</div>
                                <small className="text-muted">
                                  {detail.start} → {detail.end} ({detail.distance}km)
                                </small>
                              </div>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center">
                              <i className={`bi ${detail.mode === 'BUS' ? 'bi-bus-front' : 'bi-train-front'} me-2`}></i>
                              <div>
                                <div>{detail.routeName || detail.routeNumber}</div>
                                <small className="text-muted">
                                  {detail.start} → {detail.end} ({detail.sectionTime}분)
                                </small>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TmapPath;

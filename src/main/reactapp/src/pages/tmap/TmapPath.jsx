import React, { useState, useEffect, useRef } from 'react';
import TmapPathUI from './TmapPathUI';

const TmapPath = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('start');
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [pathType, setPathType] = useState('pedestrian');
  const [routeResult, setRouteResult] = useState('');
  const [currentPolyline, setCurrentPolyline] = useState(null);
  const [currentMarkers, setCurrentMarkers] = useState([]);
  const [currentPolylines, setCurrentPolylines] = useState([]);
  const [transitDetails, setTransitDetails] = useState(null);
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
        setCurrentPolyline(null);
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
            endName: '도착지',
            viaPoints: viaPoints.map(v => ({
              lat: v.lat.toString(),
              lon: v.lon.toString()
            }))
          })
        });

        const data = await response.json();
        drawRoute(data);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const drawRoute = (routeData) => {
    const resultData = routeData.features;

    if (!resultData || resultData.length === 0) {
      alert('유효한 경로 데이터가 없습니다.');
      return;
    }

    const tDistance = `총 거리: ${(resultData[0].properties.totalDistance / 1000).toFixed(1)}km`;
    const tTime = `총 시간: ${(resultData[0].properties.totalTime / 60).toFixed(0)}분`;
    setRouteResult(`${tDistance}, ${tTime}`);

    const lineArray = [];
    lineArray.push(new window.Tmapv2.LatLng(startPoint.lat, startPoint.lon));
    viaPoints.forEach(via => {
      lineArray.push(new window.Tmapv2.LatLng(via.lat, via.lon));
    });
    lineArray.push(new window.Tmapv2.LatLng(endPoint.lat, endPoint.lon));

    if (currentPolyline) {
      currentPolyline.setMap(null);
    }

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

  const searchTransitRoute = async () => {
    if (!startPoint || !endPoint) {
      alert('출발지와 도착지를 모두 선택해주세요.');
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

  const drawTransitRoute = (routeData) => {
    const itinerary = routeData.metaData.plan.itineraries[0];

    currentPolylines.forEach(polyline => {
      if (polyline && polyline.setMap) {
        polyline.setMap(null);
      }
    });
    setCurrentPolylines([]);

    const newPolylines = [];

    const tDistance = `총 거리: ${(itinerary.totalDistance / 1000).toFixed(1)}km`;
    const tTime = `총 시간: ${Math.round(itinerary.totalTime / 60)}분`;
    const tTransfer = `환승: ${itinerary.transferCount}회`;
    setRouteResult(`${tDistance}, ${tTime}, ${tTransfer}`);

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

    const bounds = new window.Tmapv2.LatLngBounds();
    itinerary.legs.forEach(leg => {
      bounds.extend(new window.Tmapv2.LatLng(leg.start.lat, leg.start.lon));
      bounds.extend(new window.Tmapv2.LatLng(leg.end.lat, leg.end.lon));
    });
    map.fitBounds(bounds);
  };

  const handleAddPlace = (place) => {
    // 위경도 정보가 없는 경우 POI 검색 수행
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
    <TmapPathUI
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
      handleAddPlace={handleAddPlace}
      handleRemovePlace={handleRemovePlace}
    />
  );
};

export default TmapPath;
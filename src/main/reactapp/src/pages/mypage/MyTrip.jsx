import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyTrip.style.css';
import { format } from 'date-fns';
import Loading from '../../common/Loading';
import { useNavigate } from 'react-router-dom';

const MyTrip = ({ userInfo }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem('token');
        if (userInfo && userInfo.loginId) {
          const response = await axios.get('http://localhost:8080/api/trips/mytrip', {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              loginId: userInfo.loginId
            }
          });
          const tripsData = Array.isArray(response.data) ? response.data : [];
          console.log("Fetched trips data:", tripsData);
          setTrips(tripsData);
        }
      } catch (error) {
        console.error('여행 정보 불러오기 실패:', error);
        setError('여행 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [userInfo]);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '날짜 없음';

      // MySQL datetime 형식을 처리
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '유효하지 않은 날짜';
      }
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('날짜 형식 변환 실패:', error, dateString);
      return '날짜 형식 오류';
    }
  };

  const handleTripClick = (trip) => {
    navigate(`/schedule/${trip.tripId}`, { 
      state: { 
        tripData: trip 
      }
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // currentDate를 format된 문자열로 변환
  const currentDate = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="trips-section">
      <div className="all-travels">
        <h2 className="travel-section-title">나의 여행</h2>
        <div className="travel-items">
          {trips.length > 0 ? (
            trips.map((trip) => (
              <div 
                key={trip.tripId} 
                className="travel-item p-3 mb-3 rounded"
                onClick={() => handleTripClick(trip)}
                style={{ cursor: 'pointer' }}
              >
                <div className="travel-header">
                  <div className="travel-date">
                    {(() => {
                      const startDate = format(new Date(trip.startDate), 'yyyy-MM-dd');
                      const diffDays = Math.floor(
                        (new Date(startDate).getTime() - new Date(currentDate).getTime()) 
                        / (1000 * 60 * 60 * 24)
                      );
                      if (diffDays === 0) return 'D-day';
                      return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                    })()}
                  </div>
                  <h3>{trip.title}</h3>
                  <div className="travel-modified-date">
                    최근 수정일 : {formatDate(trip.modifiedDate)}
                  </div>
                  <div className="more-options">⋮</div>
                </div>
                <p className="travel-period">{formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}</p>
              </div>
            ))
          ) : (
            <div className="no-trips">등록된 여행이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTrip;
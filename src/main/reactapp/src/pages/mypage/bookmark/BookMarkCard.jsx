import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import logoimage2 from "../../../logoimage.png"
import Card from 'react-bootstrap/Card';
import axios from 'axios';

const BookMarkCard = ({ likes }) => {
  
  const [imageError, setImageError] = useState({});
  const [places, setPlaces] = useState([]);

  const handleImageError = (placeId) => {
    setImageError(prev => ({
      ...prev,
      [placeId]: true
    }));
  };

  const mapLink = (addr) => `https://map.naver.com/p/search/${encodeURIComponent(addr)}`;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.post("https://port-0-backend-m8uaask821ad767f.sel4.cloudtype.app/api/like/likePlaceList", {
          title: likes,
        });
        setPlaces(response.data);
      } catch(error) {
        console.error("좋아요누른장소목록 불러오는중 에러", error);
      }
    };
    fetchPlaces();
  }, [likes]);

  return (
    <div>
      <h3>좋아요 목록</h3>
      <div>
        {places.length > 0 ? (
          places.map((place) => (
            <Card key={place.id} style={{ width: '18rem' }} className="card-holder">
              {!imageError[place.id] ? (
                <Card.Img
                  variant="top"
                  className="image-exist"
                  src={place.firstimage || place.first_image}
                  onError={() => handleImageError(place.id)}
                />
              ) : (
                <div className="image-placeholder">
                  <img src={logoimage2} width="200px" alt="placeholder" />
                </div>
              )}
              <Card.Body className="card-text-holder">
                <Card.Title>{place.title}</Card.Title>
                <Card.Text>{place.addr1}</Card.Text>
                <div
                  className="map-button"
                  onClick={() => window.open(mapLink(place.addr1), "_blank")}
                >
                  <FontAwesomeIcon icon={faLocationDot} /> 위치보기
                </div>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p style={{ textAlign: 'center' }}>좋아요 누른 장소가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default BookMarkCard
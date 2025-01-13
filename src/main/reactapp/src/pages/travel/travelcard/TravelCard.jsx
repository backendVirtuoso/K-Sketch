import React, { useState } from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './TravelCard.style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import logoImage from "../../../logoimage.png"

const TravelCard = ({ togotravel }) => {
  console.log("travel", togotravel);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true); // 이미지 로딩 실패 시 상태 업데이트
  };

  const mapLink = `https://map.naver.com/p/search/${encodeURIComponent(togotravel.addr1)}`;
  return (
    <div>
      <Card style={{ width: '18rem' }} className="card-holder">
        {!imageError ? (
          <Card.Img
            variant="top"
            className="image-exist"
            src={togotravel.firstImage || logoImage}
            onError={handleImageError}
          />
        ) : (
          <div
            className="image-placeholder"

          >
            <div > <img src={logoImage} width="200px" /></div>
          </div>
        )}
        <Card.Body className="card-text-holder">
          <Card.Title>{togotravel.title}</Card.Title>
          <Card.Text>
            {togotravel.addr1}
          </Card.Text>
          <Card.Text>
            {togotravel.zipcode}
          </Card.Text>

          <div
            className="map-button"
            onClick={() => window.open(mapLink, "_blank")}
          >
            <FontAwesomeIcon icon={faLocationDot} /> 위치보기
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default TravelCard
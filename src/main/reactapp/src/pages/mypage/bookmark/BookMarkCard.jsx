import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import logoimage2 from "../../../logoimage.png"
import Card from 'react-bootstrap/Card';

const BookMarkCard = ({ example }) => {
  console.log(example)
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true); // 이미지 로딩 실패 시 상태 업데이트
  };

  const mapLink = `https://map.naver.com/p/search/${encodeURIComponent(example.addr1)}`;

  return (
    <div>
      <div>
        <Card style={{ width: '18rem' }} className="card-holder">
          {!imageError ? (
            <Card.Img
              variant="top"
              className="image-exist"
              src={example.firstimage}
              onError={handleImageError}
            />
          ) : (
            <div className="image-placeholder" >
              <div><img src={logoimage2} width="200px" /></div>
            </div>
          )}
          <Card.Body className="card-text-holder">
            <Card.Title>{example.title}</Card.Title>
            <Card.Text>
              <div>{example.addr1}</div>
              <div>{example.zipcode}</div>
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
    </div>
  )
}

export default BookMarkCard
import { Carousel } from 'react-bootstrap';
import React from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './Banner.style.css'
import SearchForm from '../SearchForm';

const Banner = () => {
  return (
    <div>
      <Carousel data-bs-theme="dark">
        <Carousel.Item>
          <img
            className="d-block w-100 "
            src="https://media.triple.guide/triple-cms/c_limit,f_auto,h_1024,w_1024/f3a239f4-cff7-4cc2-aa0d-ad61081c04c7.jpeg"
            alt="First slide"
            style={{ maxHeight: "600px" }}
          />
          <Carousel.Caption >
            {/* 
              <h5>First slide label</h5>
              <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p> 
            */}
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://cdn.imweb.me/upload/S201712205a3a0910b89f5/96046ad34f43c.jpg"
            alt="Second slide"
            style={{ maxHeight: "600px" }}
          />
          <Carousel.Caption>

            {/* <h5>Second slide label</h5>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://cdn.ardentnews.co.kr/news/photo/202406/3439_16070_414.jpg"
            alt="Third slide"
            style={{ maxHeight: "600px" }}
          />
          <Carousel.Caption>
            {/* 
            <h5>Third slide label</h5>
            <p>
              Praesent commodo cursus magna, vel scelerisque nisl consectetur.
            </p> 
          */}
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  )
}

export default Banner
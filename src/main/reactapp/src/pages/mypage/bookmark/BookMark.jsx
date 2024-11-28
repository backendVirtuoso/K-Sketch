import React from 'react'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { useTravel } from '../../../hooks/useTravel';
import BookMarkCard from './BookMarkCard';
const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };
const BookMark = () => {
    const { data, isLoading } = useTravel(); // useTravel에서 로딩 상태도 반환한다고 가정

if (isLoading) {
  return <div>Loading bookmarks...</div>;
}

    console.log(data)
  return (
    <div>
             <Carousel responsive={responsive}>
  
  {data?.map((example)=><div><BookMarkCard example={example}/></div>)}
</Carousel>
    </div>
  )
}

export default BookMark
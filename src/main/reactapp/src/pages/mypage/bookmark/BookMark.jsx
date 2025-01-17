import React, { useEffect, useState } from 'react'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { useTravel } from '../../../hooks/useTravel';
import BookMarkCard from './BookMarkCard';
import axios from 'axios';
import BookMarkList from './BookMarkList';

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

const BookMark = ({userInfo}) => {
  const { data, isLoading } = useTravel(); // useTravel에서 로딩 상태도 반환한다고 가정
  const [ likes, setLikes ] = useState([]); // 좋아요 목록 상태 

  console.log(userInfo);
  useEffect(() => {
    
    const fetchLikes = async () => {
      try {
        const response = await axios.post("http://localhost:8080/api/like/userLikeList", {
          id: userInfo.loginId,
        });
        
        
        setLikes(response.data);
      } catch (error) {
        console.error("리스트 불러오는 중 에러", error);
      }
    };
  
    if (userInfo) {  
      fetchLikes();
    }
  }, []);

  

  if (isLoading) {
    return <div>Loading bookmarks...</div>;
  }

  return (
    <div>
      <Carousel responsive={responsive}>
        {likes.map((like) => (
          <BookMarkCard key={like.place_id} likes={like.place_id}/>
        ))}
      </Carousel>
      {/* <BookMarkList likes={likes}/>  */}
    </div>
  )
}

export default BookMark
import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as filledHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as emptyHeart } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';



const StyledListItem = styled.div`
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 200px;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    overflow: hidden;
    color: #fff;
    text-align: center;
    transition: transform 0.3s ease-in-out;
    font-weight: bold;

    &:hover {
    transform: scale(1.05);
    }

    background-image: url(${(props) => props.bgImage});

    &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    }

    .title {
    position: relative;
    padding: 10px;
    font-size: 1.1em;
}
`;

const HeartIcon = styled(FontAwesomeIcon)`
    position: absolute;
    bottom: 10px;
    right: 10px;
    cursor: pointer;
    color: ${(props) => (props.liked ? '#ff6b6b' : '#fff')};
    transition: color 0.3s ease;
`

// jwt토큰에서 사용자 아이디 추출 함수수
const getUserIdFromToken = (token) => {
    if(!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username;
}

const ListItem = ({ data, logo, onClick }) => {
    const [liked, setLiked] = useState(false);
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken(token); // 토큰에서 추출된 로그인한 유저의 아이디디

    const handleLikeClick = async () => {
        console.log("전송할 데이터:", {
            title: data.title,
            아이디: userId,
            lat: data.mapy,
            lon: data.mapx,
        });
        if(!token){
            alert('로그인한 사용자만 좋아요를 누를 수 있습니다.');
            return;
        }
        // 비회원은 이용 못하게 막음
        setLiked((prev) => !prev);
        try{
            console.log("----");
            await axios.post("http://localhost:8080/api/like/userLike", {
                title: data.title,
                id: userId,
                lat: data.mapy,
                lon: data.mapx,

            });

        } catch (error) {
            console.error("좋아요 저장하는 중 에러", error);
            setLiked((prev) => !prev); // 요청실패시 롤백
        }


    };


    return (
        <StyledListItem
            bgImage={data.firstimage || logo}
            onClick={onClick}
            style={{ width: "100%", height: "150px"}}>
            <div className="title">{data.title}</div>
            <HeartIcon
                icon={liked ? filledHeart : emptyHeart}
                size="lg"
                onClick={(e) => {
                    e.stopPropagation();
                    handleLikeClick();
                    // stopPropagation() => 하트아이콘 클릭시 카드전체 클릭 이벤트 수행하지 않게 함

                }}
                liked={liked ? true : undefined}
            />
        </StyledListItem>
    );
};

export default ListItem;
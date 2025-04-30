import React, { useState, useEffect } from 'react';
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

    ${props => `background-image: url(${props.$bgImage});`}

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

    .like-container {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .like-count {
        font-weight: bold;
        font-size: 1.2em;
        color: #FFF;
    }
`;

const LikeContainer = styled.div`
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    z-index: 10;
`;

const HeartIcon = styled(FontAwesomeIcon)`
    cursor: pointer;
    color: ${(props) => (props.$liked ? '#ff6b6b' : '#fff')};
    transition: color 0.3s ease;
    z-index: 10;
`;

const LikeCount = styled.span`
    color: #fff;
    font-size: 0.9em;
    font-weight: bold;
`;

// jwt토큰에서 사용자 아이디 추출 함수수
const getUserIdFromToken = (token) => {
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.username;
    } catch (error) {
        console.error('토큰 파싱 오류:', error);
        return null;
    }
}

const ListItem = ({ data, logo, onClick }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken(token);

    // 컴포넌트 마운트 시 좋아요 상태와 개수 확인
    useEffect(() => {
        const checkLikeStatus = async () => {
            try {
                // 로그인한 경우 좋아요 상태 확인
                if (token && userId) {
                    const likeResponse = await axios.get(`/api/like/check?id=${userId}`);
                    const userLikes = likeResponse.data;
                    setLiked(userLikes.includes(data.title));
                }
                
                // 좋아요 개수 확인 (로그인 상태와 관계없이 조회)
                const countResponse = await axios.get(`/api/like/count?title=${encodeURIComponent(data.title)}`);
                if (countResponse.data !== undefined) {
                    setLikeCount(countResponse.data);
                }
            } catch (error) {
                console.error('좋아요 상태 확인 실패:', error);
            }
        };

        checkLikeStatus();
    }, [token, userId, data.title]);

    const handleLikeClick = async (e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        
        if (!token) {
            alert('로그인한 사용자만 좋아요를 누를 수 있습니다.');
            return;
        }

        try {
            await axios.post("/api/like/userLike", {
                title: data.title,
                id: userId,
                lat: data.mapy,
                lon: data.mapx,
            });
            
            // 좋아요 상태 토글
            const newLiked = !liked;
            setLiked(newLiked);
            
            // 좋아요 개수 업데이트 (API에서 새로운 좋아요 개수 가져오기)
            const countResponse = await axios.get(`/api/like/count?title=${encodeURIComponent(data.title)}`);
            if (countResponse.data !== undefined) {
                setLikeCount(countResponse.data);
            }
        } catch (error) {
            console.error("좋아요 처리 중 에러 발생", error);
        }
    };

    return (
        <StyledListItem
            $bgImage={data.firstimage || logo}
            onClick={onClick}
            style={{ width: "100%", height: "150px" }}>
            <div className="title">{data.title}</div>
            <LikeContainer>
                <HeartIcon
                    icon={liked ? filledHeart : emptyHeart}
                    size="lg"
                    onClick={handleLikeClick}
                    $liked={liked}
                />
                <LikeCount>{likeCount}</LikeCount>
            </LikeContainer>
        </StyledListItem>
    );
};

export default ListItem;
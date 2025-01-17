import React from 'react';

const BookMarkList = ({likes}) => {
    return (
        <div>
            <h3>좋아요 목록</h3>
            <ul>
                {likes.map((like, index) => (
                    <li key={index}>{like.place_id}</li>
                ))}
            </ul>
        </div>
    )
}

export default BookMarkList
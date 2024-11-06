import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloud, faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons'
import './GotoLink.style.css'
import { useNavigate } from 'react-router-dom'
import Weather from '../../../weather/Weather'
import Wayto from '../../../wayto/Wayto'
import Like from '../../../like/Like'

const GotoLink = () => {
    const navigate = useNavigate();
    const gotoLink1 = () => {
        navigate('/weather')
    }
    const gotoLink2 = () => {
        navigate('/wayto')
    }
    const gotoLink3 = () => {
        navigate('/like')
    }

    return (
        <div className="link-button">
            <div className="link-button1" onClick={gotoLink1}>
                <div><FontAwesomeIcon icon={faCloud} /></div>
                <div>날씨정보</div>
            </div>
            <div className="link-button1" onClick={gotoLink2}>
                <div><FontAwesomeIcon icon={faLocationDot} /></div>
                <div>위치정보</div>
            </div>
            <div className="link-button1" onClick={gotoLink3}>
                <div><FontAwesomeIcon icon={faHeart} /></div>
                <div>인기여행지</div>
            </div>
        </div>
    )
}

export default GotoLink
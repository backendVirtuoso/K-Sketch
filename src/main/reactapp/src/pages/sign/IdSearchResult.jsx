import React from 'react';
import './scss/searchResult.scss'
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
export default function IdSearchResult(){
    const navigate = useNavigate();
    const location = useLocation();

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1을 해줍니다.
        const day = String(d.getDate()).padStart(2, '0'); // 날짜를 2자리로 맞추기

        return `${year}-${month}-${day}`;
    };


    return (
        <div id='searchResult'>
            <div className="container">
                <div className="gap">
                    <div className="title">
                        <h3>아이디 찾기</h3>
                    </div>
                    <div className="content">
                        <div className="result-box">
                            <span><strong>{location.state.name}</strong>고객님께서 등록하신 아이디는 <strong>{location.state.loginId}</strong>입니다.</span>
                            <p>가입일:<strong>{formatDate(location.state.createAt)}</strong></p>
                        </div>
                        <div className="log-in">
                            <Link to="/login">로그인</Link>
                        </div>
                        <div className="pw-search">
                            <span>비밀번호를 잊으셨나요? <Link to="/userPwSearch">비밀번호 찾기</Link></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
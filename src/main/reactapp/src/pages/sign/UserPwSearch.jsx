import React from 'react';
import './scss/usersearch.scss';
import { Link, useNavigate } from 'react-router-dom';

export default function UserPwSearch() {
    const navigate = useNavigate();

    const onClickPwSearch = (e) => {
        e.preventDefault();
        navigate('/PwSearchEmailAuthentication');
    }
    
    return (
        <div id='userSearch'>
            <div className="container">
                <div className="title">
                    <h3>비밀번호 찾기</h3>
                    <div className="location">
                        <span><a href="!#">HOME</a><img src="./images/sign/signup/bg_arrow_01.webp" alt="" /></span>
                        <strong>비밀번호 찾기</strong>
                    </div>
                </div>
                <div className="content">
                    <div className="tab-box">
                        <ul>
                            <li><Link to="/userIdSearch">아이디 찾기</Link></li>
                            <li><Link to="/userPwSearch" className='on'>비밀번호 찾기</Link></li>
                        </ul>
                    </div>
                    <div className="certification-box">
                        <button onClick={onClickPwSearch}><img src="./images/sign/signin/bg_certification_02.png" alt="" /><span>이메일 인증</span></button>
                        <button><img src="./images/sign/signin/bg_certification_01.png" alt="" /><span>휴대폰 인증</span></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

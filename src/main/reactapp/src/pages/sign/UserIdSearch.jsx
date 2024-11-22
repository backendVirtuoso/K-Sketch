import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './scss/usersearch.scss';

export default function UserIdSearch(){

    const navigate=useNavigate();

    const onClickIdSearch=(e)=>{
        e.preventDefault();
        navigate('/IdSearchEmailAuthentication');
    }

    return (
        <div id='userSearch'>
            <div className="container">
                <div className="title">
                        <h3>아이디 찾기</h3>
                        <div className="location">
                            <span><a href="!#">HOME</a><img src="./images/sign/signup/bg_arrow_01.webp" alt="" /></span>
                            <strong>아이디 찾기</strong>
                        </div>
                </div>
                <div className="content">
                    <div className="tab-box">
                        <ul>
                            <li><Link to="/userIdSearch" className='on'>아이디 찾기</Link></li>
                            <li><Link to="/userPwSearch">비밀번호 찾기</Link></li>
                        </ul>
                    </div>
                    <div className="certification-box">
                        <button onClick={onClickIdSearch}><img src="./images/sign/signin/bg_certification_02.png" alt="" /><span>이메일 인증</span></button>
                        <button><img src="./images/sign/signin/bg_certification_01.png" alt="" /><span>휴대폰 인증</span></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

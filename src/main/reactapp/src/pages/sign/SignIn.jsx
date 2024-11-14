import React, { useState } from "react";
import './scss/signIn.scss';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function SignIn() {
    const [id, setId] = useState("");
    const [pwd, setPwd] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!id || !pwd) {
            setError("모든필드를 입력해주세요");
        } else {
            setError("");

            // 로그인요청을 보내는 로직 추가
            axios
                .post("http://localhost:8080/api/login", {
                    loginId: id,
                    password: pwd,
                })
                .then((response) => {
                    console.log("로그인 성공", response.data);
                    // 로그인성공후 필요한 작업 (예: 토큰 저장 또는 리디렉션)
                    localStorage.setItem("token", response.data.token);
                    // setIsLoggedIn(true);
                    // navigate("/");
                    window.location.replace("/");
                })
                .catch((error) => {
                    console.log("로그인 에러", error);
                    setError("로그인에 실패했습니다. 아이디 비밀번호를 확인하세요 ");
                });
        }
    };

    const handleSignUp = () => {
        navigate("/signup");
    };

    const kakaohandler = () => { };

    return (
        <div id='signIn'>
            <div className="container">
                <div className="title">
                    <h3>로그인</h3>
                    <div className="location">
                        <span><a href="!#">HOME</a><img src="./images/sign/signup/bg_arrow_01.webp" alt="" /></span>
                        <strong>로그인</strong>
                    </div>
                </div>
                <div className="content">
                    <div className="signIn-form">
                        <div className="signIn-box">
                            <div className="sign-Title">
                                <h6>K-Sketch</h6>
                            </div>
                            <div className="input-box">
                                <form autoComplete='off' onSubmit={handleSubmit}>
                                    <ul>
                                        <li>
                                            <input type="text"
                                                id='userId'
                                                name='userId'
                                                placeholder='아이디'
                                                value={id}
                                                onChange={(e) => setId(e.target.value)}
                                                required />
                                        </li>
                                        <li>
                                            <input type="password"
                                                id='userPw'
                                                name='userPw'
                                                placeholder='비밀번호'
                                                value={pwd}
                                                maxLength={16}
                                                onChange={(e) => setPwd(e.target.value)}
                                                required />
                                        </li>
                                    </ul>
                                    <p className='id-save'>
                                        <span>
                                            <input type="checkbox" id='saveId' name='saveId' /><em>아이디 저장</em>
                                        </span>
                                    </p>
                                    <div className="log-in">
                                        <button type='submit'>로그인</button>
                                    </div>
                                    <div className="log-in2">
                                        <a href="!#"><img src="./images/sign/signin/ico_login_naver.webp" alt="" />네이버 로그인</a>
                                        <a href="!#"><img src="./images/sign/signin/ico_login_kakao.webp" alt="" />카카오 로그인</a>
                                    </div>
                                    <div className="search-box">
                                        <Link to="/userIdSearch">아이디 찾기</Link>
                                        <i></i>
                                        <Link to="/userPwSearch">비밀번호 찾기</Link>
                                    </div>
                                    <div className="sign-Up">
                                        <Link to="/signUp">회원가입</Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

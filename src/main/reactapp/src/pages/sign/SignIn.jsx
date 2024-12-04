import React, { useState } from "react";
import './scss/signIn.scss';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { confirmModal } from "../../reducer/confirmModal";
import axios from 'axios';

export default function SignIn() {
    const [id, setId] = useState("");
    const [pwd, setPwd] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    //  컨펌모달 매서드
    const confirmModalMethod = (msg, msg2) => {
        const obj = {
            isConfirmModal: true,
            isMsg: msg,
            isMsg2: msg2
        }
        dispatch(confirmModal(obj));
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!id || !pwd) {
            setError("모든 필드를 입력해주세요");
        } else {
            setError("");

            // 로그인 요청
            axios
                .post("http://localhost:8080/api/login", {
                    loginId: id,
                    password: pwd,
                })
                .then((response) => {
                    console.log("로그인 성공", response.data);

                    // 토큰과 유저 아이디 저장
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("username", response.data.username); // 유저 ID 저장

                    // 리디렉션 처리
                    window.location.replace("/");
                })
                .catch((error) => {
                    confirmModalMethod('아이디 비밀번호를 확인해 주세요');
                    console.log("로그인 에러", error);
                    setError("로그인에 실패했습니다. 아이디와 비밀번호를 확인하세요.");
                });
        }
    };

    const handleSignUp = () => {
        navigate("/signup");
    };

    const onNaverLogin = () => {

        window.location.href = "http://localhost:8080/oauth2/authorization/naver"
    }

    const onGoogleLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    }

    const onKakoLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
    }

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
                                        <button onClick={onNaverLogin}></button>
                                        <button onClick={onKakoLogin}></button>
                                        <button onClick={onGoogleLogin}></button>
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

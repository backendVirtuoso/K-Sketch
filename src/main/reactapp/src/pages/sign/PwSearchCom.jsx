import React from 'react';
import './scss/search.scss';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { confirmModal } from '../../reducer/confirmModal';
import axios from 'axios';

export default function PwSearchCom() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [state, setState] = React.useState({
        loginId: '',
        idGuideText: '',
        email: '',
        emailGuideText: '',
        isEmailAuthenNumberCheck: false,
    });


    // 컨펌모달
    const confirmModalMethod = (msg) => {
        const obj = {
            isConfirmModal: true,
            isMsg: msg
        }
        dispatch(confirmModal(obj));
    }

    const onChangeId = (e) => {
        const { value } = e.target;
        let loginId = '';
        let idGuideText = '';
        let isDuplicationIdBtn = false;
        const regexp1 = /([`~!@#$%^&*()\-_=+[{\]}\\/|;:'",<.>?])|([가-힣ㄱ-ㅎㅏ-ㅣ])/g;
        const regexp2 = /^(.){4,12}$/g;
        const regexp3 = /\s/g;
        loginId = value.replace(regexp1, '');

        if (value.length > 12 || regexp1.test(value) === true || regexp2.test(value) === false || regexp3.test(value) === true) {
            idGuideText = '4자이상 12자 이하의 영문과 숫자(공백제외)만 입력해 주세요.';
            isDuplicationIdBtn = false;
        }
        else {
            idGuideText = '';
            isDuplicationIdBtn = true;
        }
        setState({
            ...state,
            loginId: loginId,
            idGuideText: idGuideText,
            isDuplicationIdBtn: isDuplicationIdBtn
        })
    }

    // 이메일 입력상자 = 정규표현식
    // 제한조건
    // 제한조건1 : 특수문자 사용불가
    // 제한조건2 : 한글사용불가
    // 제한조건3 : 4자 이상 12자 이하
    // 제한조건4 : 공백허용안함
    const onChangeEmail = (e) => {
        const { value } = e.target;
        let emailGuideText = '';
        const regexp = /^[A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ`~!#$%^&*\-_=+{}|'?]+((\.)?[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?]+)*@[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?.]+((\.)?[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?.]+)*\.[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?]+$/g;

        if (value === '') {
            emailGuideText = '이메일을 입력해 주새요.';
        }
        else if (regexp.test(value) === false) {
            emailGuideText = '이메일 형식으로 입력해 주세요.';
        }
        else {
            emailGuideText = '';
        }
        setState({
            ...state,
            email: value,
            emailGuideText: emailGuideText,
        })
    }

    // 폼 데이터 보내기
    const onIdEmailSearch = (e) => {
        e.preventDefault();

        if (state.loginId === '') {
            confirmModalMethod('가입하신 아이디를 입력해 주세요.');
        }
        else if (state.email === '') {
            confirmModalMethod('가입하신 이메일 주소를 입력해 주세요.');
        }
        else {
            const userData = {
                loginId: state.loginId,
                email: state.email,
            };

            axios.post('http://localhost:8080/api/search-pw-email', userData)
                .then((response) => {
                    if (response.status === 200) {
                        console.log(response.data);  // response.data는 MemberDTO 객체 또는 null

                        if (response.data) {
                            console.log(response.data);
                            navigate('/pwSearchResult', {
                                state: {
                                    loginId: response.data.loginId,  // 서버에서 반환한 아이디
                                }
                            });
                        } else {
                            // 아이디와 이메일이 일치하지 않으면 오류 메시지
                            confirmModalMethod("가입하신 정보를 확인해주세요.");
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                    confirmModalMethod("오류가 발생했습니다.");
                });
        }
    }

    return (
        <div id='search'>
            <div className="container">
                <div className="gap">
                    <div className="header_box">
                        <h2>비밀번호 찾기</h2>
                    </div>
                </div>
                <div className="content">
                    <form autoComplete='off' onSubmit={onIdEmailSearch}>
                        <ul className="form_box">
                            <li>
                                <div className="col-gap">
                                    <label htmlFor="userId">아이디</label>
                                    <input
                                        type="text" name='userId' id='userId' placeholder='아이디를 입력해주세요'
                                        value={state.loginId}
                                        onChange={onChangeId}
                                    />
                                </div>
                            </li>
                            <li>
                                <div className="col-gap">
                                    <label htmlFor="userHp">가입 시 입력한 이메일 주소</label>
                                    <input
                                        type="text" name='userEmail' id='userEmail' placeholder='가입 시 입력한 이메일 주소를 입력해주세요'
                                        value={state.email}
                                        onChange={onChangeEmail}
                                    />
                                </div>
                            </li>
                            <div className='button_box'>
                                <button type='submit' >
                                    비밀번호 찾기
                                </button>
                            </div>
                        </ul>
                    </form>
                    <div className="signUp_btn">
                        <Link to="/signUp">
                            회원가입
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

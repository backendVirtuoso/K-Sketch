import React, { useState, useEffect } from 'react';
import './scss/signUp.scss';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { confirmModal } from '../../reducer/confirmModal';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SocialSignUp() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const selector = useSelector((state) => state);

    const [state, setState] = React.useState({

        loginId: '',
        idGuideText: '',
        isDuplicationIdBtn: false,
        idDuplicationCheck: false,  // 중복확인

        pw: '',
        pwGuideText1: '',
        pwGuideText2: '',
        pwGuideText3: '',
        pwCheck: '',
        pwCheckGuideText1: '',
        pwCheckGuideText2: '',

        email: '',
        emailGuideText: null,
        isDuplicationEmailBtn: false,
        emailDuplicationCheck: false,

        submitBtn: true,

        name: '',
        nameGuideText: '',

        birthYear: '',
        birthMonth: '',
        birthDate: '',
        birthGuidText: '',

        hp: '',
        hpGuideText: '',
        isAuthenNumberBtn: false,
        isAuthenbox: false,
        isHpAuthenNumber: null,   // 발급된 인증번호
        isHpAuthenNumberCheck: '', // 입력한 인증번호
        isAgreeMore: false,

        gender: '',
        genderGuideText: ''
    });

    //  컨펌모달 매서드
    const confirmModalMethod = (msg, msg2) => {
        const obj = {
            isConfirmModal: true,
            isMsg: msg,
            isMsg2: msg2
        }
        dispatch(confirmModal(obj));
    }

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            axios
                .get("http://localhost:8080/api/userinfo", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    const data = response.data;
                    const birthDate = data.birth || '';
                    const [birthYear, birthMonth, birthDay] = birthDate.split('-');
                    setState((prevState) => ({
                        ...prevState,
                        loginId: data.loginId || '',
                        name: data.name || '',
                        email: data.email || '',
                        gender: data.gender || '',
                        hp: data.phoneNumber || '',
                        birthYear: birthYear || '',
                        birthMonth: birthMonth || '',
                        birthDate: birthDay || '',
                        originalPw: data.password,
                        originalEmail: data.email

                    }));
                    confirmModalMethod("K-Sketch 원활한 이용을 위해서 간단한 정보를 기입해 주세요!");
                })
                .catch((err) => {
                    console.error("사용자 정보 요청 실패:", err);
                });
        } else {
        }
    }, []);

    // 아이디 입력상자 = 정규표현식
    // 제한조건
    // 제한조건1 : 특수문자 사용불가
    // 제한조건2 : 한글사용불가
    // 제한조건3 : 4자 이상 12자 이하
    // 제한조건4 : 공백허용안함
    const onChangeId = (e) => {
        const { value } = e.target;
        let loginId = '';
        setState({
            ...state,
            loginId: loginId,
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
        let isDuplicationEmailBtn = false;
        const regexp = /^[A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ`~!#$%^&*\-_=+{}|'?]+((\.)?[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?]+)*@[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?.]+((\.)?[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?.]+)*\.[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?]+$/g;

        if (value === '') {
            emailGuideText = '이메일을 입력해 주새요.';
            isDuplicationEmailBtn = false;
        }
        else if (regexp.test(value) === false) {
            emailGuideText = '이메일 형식으로 입력해 주세요.';
            isDuplicationEmailBtn = false;
        }
        else {
            emailGuideText = '';
            isDuplicationEmailBtn = true;
        }
        setState({
            ...state,
            email: value,
            emailGuideText: emailGuideText,
            isDuplicationEmailBtn: isDuplicationEmailBtn
        })
    }

    // 이메일 중복확인
    const onClickDuplicateEmail = (e) => {
        e.preventDefault();
        const value = state.email;
        let emailGuideText = '';
        let emailDuplicationCheck = false;
        const regexp = /^[A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ`~!#$%^&*\-_=+{}|'?]+((\.)?[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?]+)*@[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?.]+((\.)?[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?.]+)*\.[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9`~!#$%^&*\-_=+{}|'?]+$/g;
        if (value === '') {
            emailGuideText = '이메일을 입력해 주세요.';
            emailDuplicationCheck = false;
            confirmModalMethod(emailGuideText);
            setState({
                ...state,
                emailDuplicationCheck: emailDuplicationCheck
            })
        }
        else if (regexp.test(value) === false) {
            emailGuideText = '이메일 형식으로 입력해 주세요.';
            emailDuplicationCheck = false;
            confirmModalMethod(emailGuideText);
            setState({
                ...state,
                emailDuplicationCheck: emailDuplicationCheck
            })
        }
        else {
            axios.post('http://localhost:8080/api/check-duplicate-email', {
                email: state.email
            })
                .then((response) => {
                    console.log("서버 응답: ", response.data);
                    if (response.status === 200) {
                        if (response.data === 0) {
                            emailGuideText = '사용 할 수 있는 이메일 입니다.';
                            emailDuplicationCheck = true;
                        } else if (response.data === 1) {
                            emailGuideText = '이미 사용중인 이메일 입니다.';
                            emailDuplicationCheck = false;
                        }
                        confirmModalMethod(emailGuideText);
                        setState({
                            ...state,
                            emailDuplicationCheck: emailDuplicationCheck
                        });
                    }
                })
                .catch((err) => {
                    console.log("이메일 중복 확인 오류: ", err);
                    emailGuideText = '이메일 중복 확인 중 오류가 발생했습니다.';
                    confirmModalMethod(emailGuideText);
                });
        }
    }

    // 입력상자 = 이름
    const onChangeName = (e) => {
        let nameGuideText = '';
        let name = '';
        const { value } = e.target;
        const regexp = /[`~!@#$%^&*()\-_=+[{\]}\\/|;:'",<.>?]/g;

        name = value.replace(regexp, '');

        if (name === '') {
            nameGuideText = '이름을 입력해 주세요.';
        }
        else {
            nameGuideText = '';
        }
        setState({
            ...state,
            name: name,
            nameGuideText: nameGuideText
        })
    }

    // 입력상자 = 휴대폰
    const onChangeHp = (e) => {
        const regexp = /^[a-zA-z가-힣ㄱ-ㅎㅏ-ㅣ`~!@#$%^&*()\-_=+[{\]}\\/|;:'",<.>?]$/g
        let hp = '';
        let hpGuideText = '';
        const { value } = e.target;
        hp = value.replace(regexp, '');
        let isAuthenNumberBtn = false;

        if (e.target.value.length > 0) {
            isAuthenNumberBtn = true;
        }
        else {
            isAuthenNumberBtn = false;
        }
        if (regexp.test(value) === true) {
            hpGuideText = '숫자만 입력해 주세요.';
        }
        else {
            hpGuideText = '';
        }
        setState({
            ...state,
            hp: hp,
            isAuthenNumberBtn: isAuthenNumberBtn,
            hpGuideText: hpGuideText

        })
    }

    // 휴대폰 인증번호 발송
    const onClickAuthenModal = (e) => {
        e.preventDefault();

        const regexp = /^01[0-9]{1}[0-9]{3,4}[0-9]{4}$/g;
        const num = Math.floor(Math.random() * 900000 + 100000);
        const { value } = e.target.value;
        let isAuthenbox = false;

        if (value === '' || regexp.test(state.hp) === false) {
            confirmModalMethod('휴대폰 번호를 확인해 주세요.');
        }
        else {
            isAuthenbox = true;
            confirmModalMethod('인증번호', num)
        }

        setState({
            ...state,
            isAuthenbox: isAuthenbox,
            isHpAuthenNumber: num
        })
    }

    // 입력상자 = 휴대폰 인증번호
    const onChangeHpAuthen = (e) => {
        setState({
            ...state,
            isHpAuthenNumberCheck: e.target.value
        })
    }

    // 휴대폰 인증번호 확인
    const onClickHpAuthenOk = (e) => {
        e.preventDefault();
        let isAuthenbox = false;
        if (state.isHpAuthenNumber === Number(state.isHpAuthenNumberCheck)) {
            isAuthenbox = false;
        }
        else {
            isAuthenbox = true;
        }
        setState({
            ...state,
            isAuthenbox: isAuthenbox
        })
    }

    // 입력상자 = 생년
    const onChangeYear = (e) => {
        const regExp = /[^0-9]/g;
        let birthYear = e.target.value.replace(regExp, '');
        setState({
            ...state,
            birthYear: birthYear
        })
    }

    // 입력상자 = 생월
    const onChangeMonth = (e) => {
        const regExp = /[^0-9]/g;
        let birthMonth = e.target.value.replace(regExp, '');
        setState({
            ...state,
            birthMonth: birthMonth
        })
    }

    //입력상자 = 성별
    const onChangeGender = (e) => {
        let gender = e.target.value;
        let genderGuideText = '';
        if (gender === '') {
            genderGuideText = '성별을 선택해 주세요.'
        }
        else {
            genderGuideText = ''
        }

        setState({
            ...state,
            gender: gender,
            genderGuideText: genderGuideText
        })
    }

    // 입력상자 = 생일
    const onChangeDate = (e) => {
        const regExp = /[^0-9]/g;
        let birthDate = e.target.value.replace(regExp, '');
        setState({
            ...state,
            birthDate: birthDate
        })
    }

    // 생년월일 유효성 검사
    React.useEffect(() => {

        let birthGuidText = '';

        if (state.birthYear === '' && state.birthMonth === '' && state.birthDate === '') {
            birthGuidText = '';
        }
        else {

            if (state.birthYear.length < 4) {
                birthGuidText = '태어난 년도 4자리를 정확하게 입력해 주세요.';
            }
            else if (Number(state.birthYear) < (new Date().getFullYear() - 130)) {
                birthGuidText = '생년월일을 다시 확인해 주세요.';
            }
            else if (Number(state.birthYear) > new Date().getFullYear()) {
                birthGuidText = '생년월일이 미래로 입력 되었습니다. ';
            }
            else {

                if (state.birthMonth < 1 || state.birthMonth > 12) {
                    birthGuidText = '태어난 월을 정확하게 입력해 주세요.';
                }
                else {
                    if (state.birthDate < 1 || state.birthDate > 31) {
                        birthGuidText = '태어난 일을 정확하게 입력해 주세요.';
                    }
                    else {
                        if (Number(state.birthYear) === (new Date().getFullYear() - 14)) {
                            if (Number(state.birthMonth) === (new Date().getMonth() + 1)) {
                                if (Number(state.birthDate) === new Date().getDate()) {
                                    birthGuidText = '';
                                }
                                else if (Number(state.birthDate) > new Date().getDate()) {
                                    birthGuidText = '만 14세 미만은 가입이 불가합니다.';
                                }
                            }
                            else if (Number(state.birthMonth) > (new Date().getMonth() + 1)) {
                                birthGuidText = '만 14세 미만은 가입이 불가합니다.';
                            }
                        }
                        else if (Number(state.birthYear) > (new Date().getFullYear() - 14)) {
                            birthGuidText = '만 14세 미만은 가입이 불가합니다.';
                        }

                    }
                }

            }
        }

        setState({
            ...state,
            birthGuidText: birthGuidText
        })

    }, [state.birthYear, state.birthMonth, state.birthDate]);

    const onsubmitForm = (e) => {
        e.preventDefault();
        // 유효성 검사
       
        if (state.email === '') {
            confirmModalMethod('이메일을 다시 확인해 주세요.');
        } else if (state.name === '') {
            confirmModalMethod('이름을 입력해 주세요.');
        } else if (state.gender === '') {
            confirmModalMethod('성별을 선택해 주세요.');
        } else if (state.birthYear === '') {
            confirmModalMethod('생년을 입력해 주세요.');
        } else if (state.birthMonth === '') {
            confirmModalMethod('생월을 입력해 주세요.');
        } else if (state.birthDate === '') {
            confirmModalMethod('생일을 입력해 주세요.');
        } else {
            const regExp = /^(\d{3})(\d{3,4})(\d{4})$/g;

            // 서버로 보낼 데이터 객체 생성
            const userData = {
                name: state.name,
                phoneNumber: state.hp.replace(regExp, '$1-$2-$3'),
                birth: `${state.birthYear}-${state.birthMonth}-${state.birthDate}`,
                loginId: state.loginId,
                password: state.pw,
                email: state.email,
                gender: state.gender,
            };

            // 서버에 요청
            axios
                .post('http://localhost:8080/api/userinfo-Modify', userData)
                .then((res) => {
                    console.log(res.status);
                    if (res.status === 200) {
                        if (res.data === 1) {
                            confirmModalMethod('간편회원가입이 완료되었습니다.');
                            window.location.replace("/");
                        } else if (res.data === 0) {
                            confirmModalMethod('입력한 정보를 다시 확인해 주세요.');
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    return (
        <div id='signUp'>
            <div className="container">
                <div className="title">
                    <h3>간편회원가입</h3>
                    <div className="location">
                        <span><a href="!#">HOME</a><img src="./images/sign/signup/bg_arrow_01.webp" alt="" /></span>
                        <strong>간편회원가입</strong>
                    </div>
                </div>
                <div className="content">
                    <div className="top">
                        <div className="family">
                            <p>K-Sketch</p>
                            <i>|</i>
                            <span>Welcome. We invite you to travel to Korea!</span>
                        </div>
                        <div className="text-box">
                            <p>모든 정보를 입력하셔야 K-Sketch의 회원으로 가입하실 수 있습니다.</p>
                        </div>
                    </div>
                    <form autoComplete='off' onSubmit={onsubmitForm}>
                        <div className="form_title">
                            <h3>필수정보</h3>
                        </div>
                        <ul className="form_box">
                            <li style={{display:`none`}}>
                                <div className="input_box">
                                    <label htmlFor="loginId">아이디<span></span></label>
                                    <input
                                        type="text"
                                        name='loginId'
                                        id='loginId'
                                        placeholder='아이디 (6~15자 영문, 숫자 조합)'
                                        value={state.loginId}
                                        onChange={onChangeId}
                                        className='input_obj'
                                        disabled
                                    />
                                </div>
                                <div className="hide_text_box">
                                    <p className={`hide_text ${state.idGuideText !== '' ? ' on' : ''}`}>{state.idGuideText}</p>
                                </div>
                            </li>
                            <li>
                                <div className="input_box">
                                    <label htmlFor="userEmail">이메일<span></span></label>
                                    <input
                                        type="text"
                                        name='userEmail'
                                        id='userEmail'
                                        placeholder='이메일을 입력해 주세요'
                                        value={state.email}
                                        onChange={onChangeEmail}
                                        className='input_obj'
                                    />
                                    <div className="duplicationButton_box">
                                        <button
                                            className={`duplication_btn${state.isDuplicationEmailBtn ? '' : ' off'}`}
                                            onClick={onClickDuplicateEmail}
                                        >중복확인</button>
                                    </div>
                                </div>
                                <div className="hide_text_box">
                                    <p className={`hide_text ${state.emailGuideText !== '' ? ' on' : ''}`}>{state.emailGuideText}</p>
                                </div>
                            </li>
                            <li>
                                <div className="input_box">
                                    <label htmlFor="userName">이름<span></span></label>
                                    <input
                                        type="text" name='userName' id='userName' placeholder='이름을 입력해 주세요' className='name-input'
                                        value={state.name}
                                        onChange={onChangeName}
                                    />
                                </div>
                                <div className="hide_text_box">
                                    <p className={`hide_text ${state.nameGuideText !== '' ? ' on' : ''}`}>{state.nameGuideText}</p>
                                </div>

                            </li>
                            <li>
                                <div className="input_box">
                                    <label htmlFor="userHp">휴대폰 번호<span></span></label>
                                    <input
                                        type="text" name='userHp' id='userHp' placeholder='휴대폰 번호를 입력해 주세요 (숫자만 입력)'
                                        value={state.hp}
                                        onChange={onChangeHp}
                                        maxLength={11}
                                    />
                                    {/* <div className="duplicationButton_box">
                                            <button 
                                                disabled={!state.isAuthenNumberBtn}
                                                className={`duplication_btn${state.isAuthenNumberBtn ? '' : ' off'}`}
                                                onClick={onClickAuthenModal} 
                                                >휴대폰인증</button>
                                        </div> */}
                                </div>
                                <div className="hide_text_box">
                                    <p className={`hide_text ${state.hpGuideText !== '' ? ' on' : ''}`}>{state.hpGuideText}</p>
                                </div>
                            </li>
                            {
                                state.isAuthenbox && (
                                    <li>
                                        <div className="input_box">
                                            <label htmlFor=""></label>
                                            <input
                                                type="text" name='userHpAuthen' id='userHpAuthen' placeholder='휴대폰 인증번호를 입력해 주세요'
                                                value={state.isHpAuthenNumberCheck}
                                                onChange={onChangeHpAuthen}
                                            />
                                            <div className="duplicationButton_box">
                                                <button
                                                    className='duplication_btn'
                                                    onClick={onClickHpAuthenOk}
                                                >인증번호 <br />확인</button>
                                            </div>
                                        </div>
                                    </li>
                                )
                            }
                            <li>
                                <div className="input_box">
                                    <label htmlFor="userId">성별<span></span></label>
                                    <select name="gender" value={state.gender} onChange={onChangeGender}>
                                        <option value="">성별을 선택해 주세요</option>
                                        <option value="남성">남성</option>
                                        <option value="여성">여성</option>
                                        <option value="기타">기타</option>
                                    </select>
                                </div>
                                <div className="hide_text_box">
                                    <p className={`hide_text ${state.genderGuideText !== '' ? ' on' : ''}`}>{state.genderGuideText}</p>
                                </div>
                            </li>
                            <div className="birth_box">
                                <div className="gap">
                                    <label htmlFor="userBirth">생년월일<span></span></label>
                                    <ul>
                                        <li>
                                            <input
                                                type="text" name='userYear' id='userYear' placeholder='YYYY'
                                                value={state.birthYear}
                                                onChange={onChangeYear}
                                                maxLength={4}
                                            />
                                        </li>
                                        <li><i>/</i></li>
                                        <li>
                                            <input
                                                type="text" name='userMonth' id='userMonth' placeholder='MM'
                                                value={state.birthMonth}
                                                onChange={onChangeMonth}
                                                maxLength={2}
                                            />
                                        </li>
                                        <li><i>/</i></li>
                                        <li>
                                            <input
                                                type="text" name='userDate' id='userDate' placeholder='DD'
                                                value={state.birthDate}
                                                onChange={onChangeDate}
                                                maxLength={2}
                                            />
                                        </li>
                                    </ul>
                                </div>
                                <div className="hide_text_box">
                                    <p className={`guid_text${state.birthGuidText !== '' ? ' on' : ''}`}>{state.birthGuidText}</p>
                                </div>
                            </div>

                            <div className='button_box'>
                                <button
                                    type='submit'
                                    className={state.submitBtn === true ? '' : 'on'}
                                >
                                    <span>간편회원가입</span>
                                </button>
                            </div>
                        </ul>
                    </form>
                </div>
            </div>

        </div>
    );
};

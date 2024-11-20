import React from 'react';
import './scss/search.scss';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { confirmModal } from '../../reducer/confirmModal';
import axios from 'axios';

export default function IdSearchCom () {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [state, setState] = React.useState({
        name: '',
        nameGuideText: '',
        email: '',
        emailGuideText:'',
        isEmailAuthenNumberCheck: false,
    });


    // 컨펌모달
    const confirmModalMethod=(msg)=>{
        const obj = {
            isConfirmModal: true,
            isMsg: msg
        }
        dispatch(confirmModal(obj));
    }

    // 입력상자 = 이름
    const onChangeName=(e)=>{
        let nameGuideText = '';
        let name = '';  
        const {value} = e.target;
        const regexp = /[`~!@#$%^&*()\-_=+[{\]}\\/|;:'",<.>?]/g;
        
        name = value.replace(regexp,'');    // value값이 이름에 들어감
        
        if( name==='' ){    // 따라서 value===''도 가능하나 이름===''으로 해도 된다.
            nameGuideText ='이름을 입력해 주세요.';
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
    const onNameEmailSearch=(e)=>{
        e.preventDefault();

        if( state.name===''){
            confirmModalMethod('가입하신 이름를 입력해 주세요.');
        }
        else if( state.email==='' ){
            confirmModalMethod('가입하신 이메일 주소를 입력해 주세요.');
        }
        else {
            const userData = {
                name: state.name,
                email: state.email,
            };
    
            axios.post('http://localhost:8080/api/search-id-email', userData)
                .then((response) => {
                    if (response.status === 200) {
                        console.log(response.data);  // response.data는 MemberDTO 객체 또는 null
    
                        if (response.data) {
                            console.log(response.data);
                            //아이디와 생성일자가 존재하면 결과 페이지로 이동
                            navigate('/idSearchResult', {
                                state: {
                                    name: state.name,  // 입력한 이름
                                    loginId: response.data.loginId,  // 서버에서 반환한 아이디
                                    createAt: response.data.createAt, // 서버에서 반환한 생성일자
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
                        <h2>아이디 찾기</h2>
                    </div>
                </div>                    
                <div className="content">
                    <form autoComplete='off' onSubmit={onNameEmailSearch}>
                        <ul className="form_box">
                            <li>
                                <div className="col-gap">
                                    <label htmlFor="userName">이름</label>
                                    <input 
                                        type="text" name='userName' id='userName' placeholder='이름을 입력해주세요'
                                        value={state.name}
                                        onChange={onChangeName}
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
                                    아이디 찾기
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

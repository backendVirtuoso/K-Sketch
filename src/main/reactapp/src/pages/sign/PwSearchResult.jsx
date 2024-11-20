import React from 'react';
import './scss/searchResult.scss'
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { confirmModal } from '../../reducer/confirmModal';
import axios from 'axios';
export default function PwSearchResult(){
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location =useLocation();
    const [state,setState]=React.useState({
        pw:'',
        pwCheck:'',
        pwOk:false,
        pwCheckOk:false
    })

    //  컨펌모달 매서드
    const confirmModalMethod=(msg,msg2)=>{
        const obj = {
            isConfirmModal: true,
            isMsg: msg,
            isMsg2:msg2
        }
        dispatch(confirmModal(obj));
    }



    const onChangePw=(e)=>{
        const {value} = e.target;
        let pw = '';
        let pwOk=false;
        const regexp1 = /((?=.*[A-Za-z])+(?=.*[0-9])+)|((?=.*[A-Za-z])+(?=.*[`~!@#$%^&*()\-_=+[{\]}\\/|;:'",<.>?])+)|(?=.*[0-9])+(?=.*[`~!@#$%^&*()\-_=+[{\]}\\/|;:'",<.>?])+/g;
        const regexp2 = /(.)\1\1\1/g;
        const regexp3 = /^(.){8,16}$/g;
        const regexp4 = /[가-힣ㄱ-ㅎㅏ-ㅣ]/g;
        const regexp5 = /\s/g;
        pw = value.replace(regexp4,'');
        if( regexp3.test(value)===false ){
            pwOk=false;
        }    
        else if( regexp1.test(value)===false || regexp4.test(value)===true || regexp5.test(value)===true ){
            pwOk=false;
        }
        else if( regexp2.test(value)===true ){
            pwOk=false;
        }
        else {
            pwOk=true;
        }
        setState({
            ...state,
            pw: pw,
            pwOk:pwOk
        })
    }

    const onChangePwCheck=(e)=>{
        const {value} = e.target;
        let pwCheck = '';
        let pwCheckOk = false;
        const regexp1 = /\s/g;
        const regexp2 = /[가-힣ㄱ-ㅎㅏ-ㅣ]/g;
        pwCheck = value.replace(regexp2,''); 
        if( regexp1.test(value)===true || value==='' || regexp2.test(value)===true ){
            pwCheckOk = false;
        }
        else if( value!==state.pw ){
            pwCheckOk = false;
        }
        else {
            pwCheckOk = true;
        }
        
        setState({
            ...state,
            pwCheck: pwCheck,
            pwCheckOk:pwCheckOk
        })
    }

    const onClickPwChange=(e)=>{
        e.preventDefault();

        if( state.pw==='' ) {
            confirmModalMethod('새 비밀번호를 입력해 주세요.');
        }
        else if( state.pwCheck==='' ) {
            confirmModalMethod('새 비밀번호를 한번 더 입력해 주세요.');
        }
        else if( state.pwOk===false ) {
            confirmModalMethod('비밀번호 형식에 맞게 입력해 주세요.');
        }
        else if( state.pwCheckOk===false ) {
            confirmModalMethod('비밀번호가 동일하지 않습니다.','확인 후 다시 시도해 주세요');
        }
        else {
            const userData = {
                loginId: location.state.loginId,
                password: state.pw,
            };
    
            axios.post('http://localhost:8080/api/pw-change', userData)
                .then((response) => {
                    if (response.status === 200) {
                        console.log(response.data);  // response.data는 MemberDTO 객체 또는 null
    
                        if (response.data) {
                            console.log(response.data);
                            confirmModalMethod('비밀번호가 변경되었습니다.','변경된 비밀번호로 로그인 해주세요.')
                            navigate('/login');
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
        <div id='searchResult'>
            <div className="container">
                <div className="gap">
                    <div className="title">
                        <h3>비밀번호 찾기</h3>
                    </div>
                    <div className="content">
                        <div className="pw-result-box">
                            <span>새로운 비밀번호를 입력해 주세요.</span>
                        </div>
                        <div className="input-box">
                            <ul>
                                <li>
                                    <label htmlFor="userPw">새 비밀번호</label>
                                    <input type="password" id='userPw' name='userPw' placeholder='새 비밀번호를 입력해 주세요' onChange={onChangePw}/>
                                </li>
                                <li>
                                    <label htmlFor="userRePw">새 비밀번호 확인</label>
                                    <input type="password" id='userRePw' name='userRePw' placeholder='새 비밀번호를 한번 더 입력해 주세요' onChange={onChangePwCheck}/>
                                </li>
                            </ul>
                        </div>
                        <div className="pw-change-btn">
                            <a href="!#" onClick={onClickPwChange}>비밀번호 변경</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
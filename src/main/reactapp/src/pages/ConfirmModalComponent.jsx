import React, { useEffect } from 'react';
import './scss/ConfirmModal.scss';
import { useDispatch, useSelector } from 'react-redux';
import { confirmModal } from '../reducer/confirmModal';

export default function ConfirmModalComponent() {

    const confirmModalMethod = (msg, msg2) => {
        const obj = {
            isConfirmModal: false,
            isMsg: msg,
            isMsg2: msg2

        }
        dispatch(confirmModal(obj));
    }

    const dispatch = useDispatch();
    const selector = useSelector((state) => state);

    useEffect(() => {
        if (selector.confirmModal.isConfirmModal) {
            document.body.style.overflow = 'hidden'; // 스크롤 비활성화
        } else {
            document.body.style.overflow = 'auto'; // 모달이 닫히면 스크롤 복원
        }

        // Cleanup: 컴포넌트가 언마운트될 때 스크롤 복원
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [selector.confirmModal.isConfirmModal]);

    // 컨펌 모달창 닫기
    const onClickClose = (e) => {
        e.preventDefault();
        confirmModalMethod(false);
    }

    return (
        <div id='confirmModal'>
            <div className="container">
                <div className="content">
                    <div className="title">
                        <h2>{selector.confirmModal.isMsg}</h2>
                        <span>{selector.confirmModal.isMsg2}</span>
                    </div>
                    <button onClick={onClickClose}>닫기</button>
                </div>
            </div>
        </div>
    );
};

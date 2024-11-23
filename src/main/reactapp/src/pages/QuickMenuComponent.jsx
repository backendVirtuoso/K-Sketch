import React, { useState } from 'react';
import './scss/QuickMenu.scss';
import { useDispatch, useSelector } from "react-redux";
import Room from './chat/Room';
import classNames from 'classnames';  // classNames를 사용

export default function QuickMenuComponent() {
    const dispatch = useDispatch();
    const selector = useSelector((state) => state);

    const [state, setState] = useState({
        showChat: false, // 채팅방 표시 여부 상태 추가
    });

    const toggleChat = () => {
        setState((prevState) => ({
            ...prevState,
            showChat: !prevState.showChat, // showChat 상태 토글
        }));
    };

    return (
        <div id="QuickMenu">
            <div className="recent" onClick={toggleChat}>
                <button className="recent-btn">Live Chat</button>
            </div>

            {/* classNames로 조건부 클래스 추가 */}
            <div
                className={classNames('recent-box', { 'show-chat': state.showChat })}
            >
                {state.showChat && <Room />}
            </div>
        </div>
    );
}

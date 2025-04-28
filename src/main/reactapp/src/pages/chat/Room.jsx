import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RoomDetail from './RoomDetail'; // 방 디테일 컴포넌트를 가져옵니다.
import './scss/room.scss'; // 스타일 시트
import { useDispatch } from 'react-redux';
import { confirmModal } from '../../reducer/confirmModal';

const Room = () => {
    const [roomName, setRoomName] = useState(''); // 채팅방 이름 상태
    const [chatrooms, setChatrooms] = useState([]); // 채팅방 리스트 상태
    const [selectedRoom, setSelectedRoom] = useState(null); // 선택된 방 상태
    const [messages, setMessages] = useState({}); // 각 방에 대한 메시지 상태
    const [error, setError] = useState(''); // 에러 상태 추가
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

    // 컴포넌트가 마운트될 때 방 목록을 가져옵니다.
    useEffect(() => {
        findAllRoom();
    }, []);

    // 방 목록을 가져오는 함수
    const findAllRoom = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get('https://port-0-backend-m8uaask821ad767f.sel4.cloudtype.app/api/kafkachat/rooms', {
                headers: headers,
            });
            // 응답 데이터가 배열인지 확인하고 설정
            setChatrooms(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("방 목록을 가져오는 데 실패했습니다.", error);
            setError("방 목록을 가져오는 데 실패했습니다.");
            setChatrooms([]); // 에러 발생 시 빈 배열로 초기화
        }
    };

    // 새 방을 생성하는 함수
    const createRoom = async () => {
        if (!roomName) { // 방 이름이 없으면 경고
            confirmModalMethod("로그인이 필요한 서비스입니다");
            return;
        }
        try {
            const token = localStorage.getItem('token'); // 토큰 가져오기
            if (!token) {
                confirmModalMethod("로그인이 필요한 서비스입니다");
                return;
            }

            const params = new URLSearchParams();
            params.append("name", roomName); // 새 방 이름 추가
            const response = await axios.post('https://port-0-backend-m8uaask821ad767f.sel4.cloudtype.app/api/kafkachat/room', params, {
                headers: { Authorization: `Bearer ${token}` },
            });

            confirmModalMethod(`${response.data.name} 방 개설에 성공하였습니다.`);
            setRoomName(''); // 방 이름 초기화
            findAllRoom(); // 방 목록 다시 가져오기
        } catch (error) {
            console.error("채팅방 개설에 실패하였습니다.", error);
            confirmModalMethod("채팅방 개설에 실패하였습니다.");
        }
    };

    // 방을 클릭하면 해당 방을 선택하는 함수
    const enterRoom = (roomId) => {
        const token = localStorage.getItem('token'); // 로컬 스토리지에서 JWT 토큰 가져오기
        if (!token) {
            confirmModalMethod("로그인이 필요한 서비스입니다");
            return;
        }
        setSelectedRoom(roomId); // 선택된 방 설정
    };

    // 방 상세보기 화면을 닫는 함수
    const closeRoomDetail = () => {
        setSelectedRoom(null); // 선택된 방을 초기화하여 방 목록으로 돌아가게 함
    };

    // 메시지를 추가하는 함수
    const addMessage = (roomId, message) => {
        setMessages(prevMessages => ({
            ...prevMessages,
            [roomId]: [...(prevMessages[roomId] || []), message]
        }));
    };

    return (
        <div className="container my-5">
            <h3 className="text-center mb-4">
                {selectedRoom ?
                    "채팅방: " + (chatrooms.find(room => room.roomId === selectedRoom)?.name || "알 수 없는 방") :
                    "채팅방 리스트"
                }
            </h3>
            {error && <div className="alert alert-danger">{error}</div>}
            {!selectedRoom ? (
                <>
                    <div className="input-group mb-4">
                        <input
                            type="text"
                            className="form-control"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            onKeyUp={(e) => e.key === 'Enter' && createRoom()}
                            placeholder="채팅방 제목을 입력하세요"
                        />
                        <button className="btn btn-primary" type="button" onClick={createRoom}>방 만들기</button>
                    </div>
                    <ul className="list-group">
                        {Array.isArray(chatrooms) && chatrooms.length > 0 ? (
                            chatrooms.map(item => (
                                <li
                                    key={item.roomId}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => enterRoom(item.roomId)}
                                >
                                    {item.name}
                                </li>
                            ))
                        ) : (
                            <li className="list-group-item text-center">
                                {error ? "오류가 발생했습니다." : "채팅방이 없습니다."}
                            </li>
                        )}
                    </ul>
                </>
            ) : (
                <RoomDetail
                    roomId={selectedRoom}
                    onClose={closeRoomDetail}
                    messages={messages[selectedRoom] || []}
                    onSendMessage={(msg) => addMessage(selectedRoom, msg)}
                />
            )}
        </div>
    );
};

export default Room;

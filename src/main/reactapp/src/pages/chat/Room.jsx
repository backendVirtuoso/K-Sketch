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
      const token = localStorage.getItem('token'); // 로컬 스토리지에서 JWT 토큰 가져오기
      const headers = token ? { Authorization: `Bearer ${token}` } : {}; // 토큰이 있으면 헤더에 추가
      const response = await axios.get('http://localhost:8080/api/kafkachat/rooms', {
        headers: headers, // 인증 헤더 추가
      });
      setChatrooms(response.data); // 방 목록을 상태에 저장
    } catch (error) {
      console.error("방 목록을 가져오는 데 실패했습니다.", error);
      setError("방 목록을 가져오는 데 실패했습니다."); // 에러 메시지 상태 업데이트
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
      const response = await axios.post('http://localhost:8080/api/kafkachat/room', params, {
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
          "채팅방: " + chatrooms.find(room => room.roomId === selectedRoom)?.name :
          "채팅방 리스트"
        }
      </h3>
      {error && <div className="alert alert-danger">{error}</div>} {/* 에러 메시지 표시 */}
      {!selectedRoom ? ( // 선택된 방이 없으면 방 목록을 보여줌
        <>
          <div className="input-group mb-4">
            <input
              type="text"
              className="form-control"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)} // 방 이름 입력 시 상태 업데이트
              onKeyUp={(e) => e.key === 'Enter' && createRoom()} // 엔터 키로 방 생성
              placeholder="채팅방 제목을 입력하세요"
            />
            <button className="btn btn-primary" type="button" onClick={createRoom}>방 만들기</button>
          </div>
          <ul className="list-group">
            {chatrooms.map(item => ( // 채팅방 목록을 표시
              <li
                key={item.roomId}
                className="list-group-item list-group-item-action"
                onClick={() => enterRoom(item.roomId)} // 방 클릭 시 해당 방으로 이동
              >
                {item.name}
              </li>
            ))}
          </ul>
        </>
      ) : ( // 방을 선택하면 RoomDetail 컴포넌트로 방 내용을 표시
        <RoomDetail
          roomId={selectedRoom}
          onClose={closeRoomDetail} // 방 상세보기 닫기
          messages={messages[selectedRoom] || []} // 해당 방의 메시지 전달
          onSendMessage={(msg) => addMessage(selectedRoom, msg)} // 메시지 추가
        />
      )}
    </div>
  );
};

export default Room;

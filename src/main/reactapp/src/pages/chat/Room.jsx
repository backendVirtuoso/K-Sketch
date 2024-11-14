import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './scss/room.scss'

const Room = () => {
  const [roomName, setRoomName] = useState('');
  const [chatrooms, setChatrooms] = useState([]);

  useEffect(() => {
    findAllRoom();
  }, []);

  const findAllRoom = async () => {
    try {
      const token = localStorage.getItem('token'); // 토큰을 가져옵니다.
      const response = await axios.get('http://localhost:8080/api/kafkachat/rooms', {
        headers: {
          Authorization: `Bearer ${token}`, // 인증 헤더를 추가합니다.
        },
      });
      setChatrooms(response.data);
    } catch (error) {
      console.error("방 목록을 가져오는 데 실패했습니다.", error);
      alert("방 목록을 가져오는 데 실패했습니다.");
    }
  };

  const createRoom = async () => {
    if (roomName === "") {
      alert("방 제목을 입력해 주십시요.");
      return;
    }
    try {
      const token = localStorage.getItem('token'); // 토큰을 가져옵니다.
      const params = new URLSearchParams();
      params.append("name", roomName);
      const response = await axios.post('http://localhost:8080/api/kafkachat/room', params, {
        headers: {
          Authorization: `Bearer ${token}`, // 인증 헤더를 추가합니다.
        },
      });
      alert(`${response.data.name} 방 개설에 성공하였습니다.`);
      setRoomName('');
      findAllRoom();
    } catch (error) {
      console.error("채팅방 개설에 실패하였습니다.", error);
      alert("채팅방 개설에 실패하였습니다.");
    }
  };

  const enterRoom = (roomId) => {
    const sender = prompt('대화명을 입력해 주세요.');
    if (sender) {
      localStorage.setItem('wschat.sender', sender);
      localStorage.setItem('wschat.roomId', roomId);
      window.location.href = `/api/kafkachat/room/enter/${roomId}`;
    }
  };

  return (
    <div className="container my-5">
      <h3 className="text-center mb-4">채팅방 리스트</h3>
      <div className="input-group mb-4">
        <div className="input-group-prepend">
        </div>
        <input
          type="text"
          className="form-control"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && createRoom()}
          placeholder="채팅방 제목을 입력하세요"
        />
        <div className="input-group-append">
          <button className="btn btn-primary" type="button" onClick={createRoom}>방만들기</button>
        </div>
      </div>
      <ul className="list-group">
        {chatrooms.map(item => (
          <li
            key={item.roomId}
            className="list-group-item list-group-item-action"
            onClick={() => enterRoom(item.roomId)}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Room;

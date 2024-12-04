import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './scss/roomDetail.scss'
import { useParams } from 'react-router-dom';

const RoomDetail = ({ roomId, onClose, messages, onSendMessage }) => {
  const [room, setRoom] = useState({});
  const [sender, setSender] = useState(localStorage.getItem('username') || ''); // 로그인한 유저 아이디를 초기값으로 설정
  const [message, setMessage] = useState('');
  const [entered, setEntered] = useState(false); // 'ENTER' 메시지를 한 번만 받도록 관리하는 상태
  const ws = useRef(null);
  const isConnected = useRef(false);
  const messageListRef = useRef(null); // 메시지 목록을 참조하기 위한 ref

  const findRoom = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/kafkachat/room/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // JWT 토큰 포함
        }
      });
      setRoom(response.data);
    } catch (error) {
      console.error("Error finding room:", error);
      if (error.response && error.response.status === 403) {
        alert("접근이 거부되었습니다. 로그인 상태를 확인하세요.");
      }
    }
  }, [roomId]);

  const connect = useCallback(() => {
    if (isConnected.current) return; // 이미 연결되어 있다면 재연결하지 않음

    const sock = new SockJS("http://localhost:8080/ws");
    ws.current = Stomp.over(sock);

    ws.current.connect(
      { Authorization: `Bearer ${localStorage.getItem('token')}` },
      () => {
        isConnected.current = true; // 연결 상태 설정
        ws.current.subscribe(`/sub/kafkachat/room/${roomId}`, (msg) => {
          const recv = JSON.parse(msg.body);

          if (recv.type === 'ENTER' && !entered) {
            // ENTER 메시지를 한 번만 처리
            setEntered(true); // ENTER 메시지를 받은 후 상태를 true로 설정
            onSendMessage({ type: recv.type, sender: "입장", message: `${recv.sender}님이 입장했습니다.` });
          } else if (recv.type === 'TALK') {
            // TALK 메시지 처리: 실제 채팅 메시지
            onSendMessage({ type: recv.type, sender: recv.sender, message: recv.message });
          }
        });

        ws.current.send("/pub/kafkachat/message", {}, JSON.stringify({ type: 'ENTER', roomId, sender }));
      },
      (error) => {
        console.error("Connection error: ", error);
        setTimeout(connect, 5000);
      }
    );
  }, [roomId, sender, entered, onSendMessage]);

  const sendMessage = () => {
    if (ws.current && ws.current.connected) {
      const msg = { type: 'TALK', roomId, sender, message };
      ws.current.send("/pub/kafkachat/message", {}, JSON.stringify(msg));
      setMessage('');
      onSendMessage(msg);
    } else {
      console.error("WebSocket is not connected.");
    }
  };

  const handleBackClick = () => {
    if (ws.current && ws.current.connected) {
      // 'QUIT' 메시지를 보내고 방을 나간다.
      const msg = { type: 'QUIT', roomId, sender };
      ws.current.send("/pub/kafkachat/message", {}, JSON.stringify(msg));
    }
    onClose(); // 방을 나가면 RoomDetail을 닫는다.
  };

  useEffect(() => {
    if (!sender) {
      // sender가 설정되지 않은 경우 로그인 ID를 다시 물어볼 수 있도록 설정
      const inputSender = prompt('대화명을 입력해 주세요.');
      if (inputSender) {
        setSender(inputSender);
        localStorage.setItem('username', inputSender); // 대화명으로 설정
      }
    }

    findRoom();
    connect();

    return () => {
      if (ws.current) ws.current.disconnect(() => {
        isConnected.current = false; // 연결 해제 시 상태 초기화
      });
    };
  }, [roomId, findRoom, connect, sender]);

  // 메시지 목록이 업데이트될 때마다 자동으로 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight; // 스크롤을 가장 아래로 이동
    }
  }, [messages]);

  return (
    <div className="container my-5">
      <button onClick={handleBackClick} className="btn btn-secondary mb-3">뒤로가기</button>
      <div className="input-group mb-4">
        <input
          type="text"
          className="form-control"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="메시지를 입력하세요"
        />
        <button className="btn btn-primary" type="button" onClick={sendMessage}>보내기</button>
      </div>
      <ul
        ref={messageListRef}
        className="list-group"
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {messages.map((msg, index) => (
          <li key={index} className="list-group-item">
            <strong>{msg.sender}</strong>: {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomDetail;

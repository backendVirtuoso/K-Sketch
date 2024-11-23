import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './scss/roomDetail.scss'
import { useParams } from 'react-router-dom';

const RoomDetail = () => {
  const { roomId } = useParams(); // URL에서 roomId 가져오기
  const [room, setRoom] = useState({});
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const ws = useRef(null); // useRef로 ws를 관리

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
    const sock = new SockJS("http://localhost:8080/ws", null);
    ws.current = Stomp.over(sock);

    ws.current.connect({}, () => {
      setTimeout(() => {
        ws.current.subscribe(`/sub/kafkachat/room/${roomId}`, (message) => {
          const recv = JSON.parse(message.body);
          recvMessage(recv);
        });

        ws.current.send("/pub/kafkachat/message", {},
          JSON.stringify({ type: 'ENTER', roomId, sender })
        );
      }, 500);
    }, (error) => {
      console.error("Connection error: ", error);
      setTimeout(connect, 5000);
    });
  }, [roomId, sender]);

  useEffect(() => {
    const storedSender = localStorage.getItem('wschat.sender');
    if (storedSender) {
      setSender(storedSender);
    }

    if (roomId) {
      findRoom();
    }
  }, [roomId, findRoom]);

  useEffect(() => {
    if (roomId && sender) {
      connect();
    }

    return () => {
      if (ws.current) {
        ws.current.disconnect();
      }
    };
  }, [roomId, sender]);

  const sendMessage = () => {
    if (ws.current && ws.current.connected) {
      ws.current.send("/pub/kafkachat/message", {}, JSON.stringify({ type: 'TALK', roomId, sender, message }));
      setMessage('');
    } else {
      console.error("WebSocket is not connected.");
    }
  };

  const recvMessage = (recv) => {
    setMessages(prevMessages => [
      { type: recv.type, sender: recv.type === 'ENTER' ? '[알림]' : recv.sender, message: recv.message },
      ...prevMessages
    ]);
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">{room.name}</h2>
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
      <ul className="list-group">
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

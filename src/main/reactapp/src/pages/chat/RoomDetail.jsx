import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './scss/roomDetail.scss'
import { useParams } from 'react-router-dom';

const RoomDetail = ({ roomId, onClose, messages, onSendMessage }) => {
    const [room, setRoom] = useState({});
    const [sender, setSender] = useState(localStorage.getItem('username') || '');
    const [message, setMessage] = useState('');
    const [entered, setEntered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const ws = useRef(null);
    const isConnected = useRef(false);
    const messageListRef = useRef(null);
    const connectTimeout = useRef(null);
    const isInitialMount = useRef(true);

    const loadPreviousMessages = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/chat/messages/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data && Array.isArray(response.data)) {
                const messages = [...response.data];
                messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                messages.forEach(msg => onSendMessage({
                    type: msg.type,
                    sender: msg.sender,
                    message: msg.message
                }));
            }
        } catch (error) {
            console.error("Error loading previous messages:", error);
        } finally {
            setIsLoading(false);
        }
    }, [roomId, onSendMessage]);

    const disconnect = useCallback(() => {
        if (ws.current && ws.current.connected) {
            try {
                ws.current.disconnect(() => {
                    console.log("WebSocket disconnected");
                    isConnected.current = false;
                });
            } catch (error) {
                console.error("Error during disconnect:", error);
                isConnected.current = false;
            }
        }
        if (connectTimeout.current) {
            clearTimeout(connectTimeout.current);
            connectTimeout.current = null;
        }
    }, []);

    const connect = useCallback(() => {
        if (isConnected.current || !sender) {
            console.log("Skipping connection: ", 
                isConnected.current ? "Already connected" : "No sender specified");
            return;
        }

        // 기존 연결 정리
        disconnect();

        try {
            const sock = new SockJS("http://localhost:8080/ws");
            ws.current = Stomp.over(sock);
            ws.current.debug = null;

            const headers = {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            };

            const onConnect = () => {
                console.log("WebSocket connection established");
                isConnected.current = true;

                try {
                    ws.current.subscribe(`/sub/kafkachat/room/${roomId}`, (msg) => {
                        try {
                            const recv = JSON.parse(msg.body);
                            if (recv.type === 'ENTER' && !entered) {
                                setEntered(true);
                                onSendMessage({ 
                                    type: recv.type, 
                                    sender: "입장", 
                                    message: `${recv.sender}님이 입장했습니다.` 
                                });
                            } else if (recv.type === 'TALK') {
                                onSendMessage({ 
                                    type: recv.type, 
                                    sender: recv.sender, 
                                    message: recv.message 
                                });
                            }
                        } catch (error) {
                            console.error("Error processing message:", error);
                        }
                    });

                    ws.current.send("/pub/kafkachat/message", headers, 
                        JSON.stringify({ 
                            type: 'ENTER', 
                            roomId, 
                            sender 
                        })
                    );
                } catch (error) {
                    console.error("Error during subscription:", error);
                    handleReconnect();
                }
            };

            const onError = (error) => {
                console.error("WebSocket connection error:", error);
                handleReconnect();
            };

            const handleReconnect = () => {
                isConnected.current = false;
                if (connectTimeout.current) {
                    clearTimeout(connectTimeout.current);
                }
                connectTimeout.current = setTimeout(() => {
                    console.log("Attempting to reconnect...");
                    connect();
                }, 5000);
            };

            ws.current.connect(headers, onConnect, onError);
        } catch (error) {
            console.error("Error creating WebSocket connection:", error);
            isConnected.current = false;
        }
    }, [roomId, sender, entered, onSendMessage, disconnect]);

    const sendMessage = () => {
        if (!message.trim()) return;
        
        if (ws.current && ws.current.connected && isConnected.current) {
            try {
                const msg = { type: 'TALK', roomId, sender, message };
                ws.current.send("/pub/kafkachat/message", {}, JSON.stringify(msg));
                setMessage('');
            } catch (error) {
                console.error("Error sending message:", error);
                isConnected.current = false;
                connect();
            }
        } else {
            console.error("WebSocket is not connected. Attempting to reconnect...");
            connect();
        }
    };

    const handleBackClick = () => {
        if (ws.current && ws.current.connected && isConnected.current) {
            try {
                const msg = { type: 'QUIT', roomId, sender };
                ws.current.send("/pub/kafkachat/message", {}, JSON.stringify(msg));
                disconnect();
                onClose();
            } catch (error) {
                console.error("Error during quit:", error);
                isConnected.current = false;
                onClose();
            }
        } else {
            onClose();
        }
    };

    const findRoom = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/kafkachat/room/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
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

    // 초기 설정을 위한 useEffect
    useEffect(() => {
        if (!sender) {
            const inputSender = prompt('대화명을 입력해 주세요.');
            if (inputSender) {
                setSender(inputSender);
                localStorage.setItem('username', inputSender);
            }
        }
    }, []);

    // 채팅방 연결을 위한 useEffect
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            findRoom();
            loadPreviousMessages();
            connect();
        }

        return () => {
            disconnect();
        };
    }, [roomId, findRoom, connect, disconnect, loadPreviousMessages]);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="container my-5">
            <button onClick={handleBackClick} className="btn btn-secondary mb-3">뒤로가기</button>
            {isLoading ? (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
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
                </>
            )}
        </div>
    );
};

export default RoomDetail;


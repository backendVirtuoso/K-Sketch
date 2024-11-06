import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserRegistForm = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        loginId: "",
        password: "",
        name: "",
        phoneNumber: "",
        gender: "",
        birth: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({
            ...user,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitted User Data:", user);
        axios
            .post("http://localhost:8080/api/join", user)
            .then((response) => {
                console.log("서버통신 성공", response.data);
                alert("회원가입완료");
                // 폼초기화
                setUser({
                    loginId: "",
                    password: "",
                    name: "",
                    phoneNumber: "",
                    gender: "",
                    birth: "",
                });
                // 로그인 페이지로 리디렉션
                navigate("/login");
            })
            .catch((error) => {
                console.log("에러", error);
            });
        // 여기에서 사용자를 서버에 제출하는 코드를 추가할 수 있습니다.
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>회원가입</h2>
            <div>
                <label>Login ID:</label>
                <input
                    type="text"
                    name="loginId"
                    value={user.loginId}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Phone Number:</label>
                <input
                    type="tel"
                    name="phoneNumber"
                    value={user.phoneNumber}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Gender:</label>
                <select name="gender" value={user.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div>
                <label>Birth Date:</label>
                <input
                    type="date"
                    name="birth"
                    value={user.birth}
                    onChange={handleChange}
                />
            </div>
            <button type="submit">가입하기</button>
        </form>
    );
};

export default UserRegistForm;

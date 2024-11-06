import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsLoggedIn }) => {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!id || !pwd) {
      setError("모든필드를 입력해주세요");
    } else {
      setError("");

      // 로그인요청을 보내는 로직 추가
      axios
        .post("http://localhost:8080/api/login", {
          loginId: id,
          password: pwd,
        })
        .then((response) => {
          console.log("로그인 성공", response.data);
          // 로그인성공후 필요한 작업 (예: 토큰 저장 또는 리디렉션)
          localStorage.setItem("token", response.data.token);
          // setIsLoggedIn(true);
          // navigate("/");
          window.location.replace("/");
        })
        .catch((error) => {
          console.log("로그인 에러", error);
          setError("로그인에 실패했습니다. 아이디 비밀번호를 확인하세요 ");
        });
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const kakaohandler = () => { };

  return (
    <div style={{ width: "300px", margin: "100px auto" }}>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>아이디:</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>비밀번호:</label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          type="submit"
          style={{ padding: "10px 20px", marginTop: "10px" }}
        >
          로그인
        </button>
        <button
          onClick={handleSignUp}
          style={{ padding: "10px 20px", marginTop: "10px", marginLeft: "5px" }}
        >
          회원가입
        </button>
      </form>
      <button onClick={kakaohandler}>카카오 로그인</button>
    </div>
  );
};

export default Login;

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AppLayout.style.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { confirmModal } from "../reducer/confirmModal";
import axios from "axios";
import logo from "../logomakerproject.mp4";

const AppLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추가
  const [userRole, setUserRole] = useState("");

  //  컨펌모달 매서드
  const confirmModalMethod = (msg, msg2) => {
    const obj = {
      isConfirmModal: true,
      isMsg: msg,
      isMsg2: msg2
    }
    dispatch(confirmModal(obj));
  }

  // 컴포넌트가 마운트될 때 로컬스토리지에서 토큰을 확인하여 로그인 상태를 결정함
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    console.log(token);
    setIsLoggedIn(!!token); // 토큰이 존재하면 true, 없으면 false
    setUserRole(role || "");
  }, [isLoggedIn]);

  const handleLogin = () => {
    navigate("/login");
  };

  const gotohome = () => {
    navigate("/");
  };

  const kafkaChatPage = () => {
    navigate("/kafka");
  };

  const error = () => {
    confirmModalMethod("로그인이 필요한 서비스입니다. 로그인하시겠습니까? ");
    navigate("/login");
  };

  // 로그아웃
  const handleLogout = async () => {
    // 로컬 스토리지에서 토큰 삭제
    confirmModalMethod("로그아웃되었습니다.");
    
    try {
      await axios.post("/api/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");
      setIsLoggedIn(false);
      navigate("/");
      console.log("토큰 사라짐? : ", localStorage.getItem("token"));
    } catch (error) {
      console.error("로그아웃 중 오류 발생 : ", error);
    }
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary navbar-fixed">
      <Container fluid style={{ backgroundColor: "white" }}>
        <Navbar.Brand href="/" onClick={gotohome} className="header">
          <video src={logo} autoPlay loop muted className="video" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0 navbarstyle"
            style={{ maxHeight: "200px", width: "100%" }}
            navbarScroll
          >
            {/* <div className="navlink"> */}
            {/* <Nav.Link href="/kafka">채팅</Nav.Link> */}
            <Nav.Link onClick={isLoggedIn ? kafkaChatPage : error} className="path">
              채팅
            </Nav.Link>
            <Nav.Link href="/schedule" className="path">일정생성</Nav.Link>
            <Nav.Link href="/places" className="path">장소 api</Nav.Link>
            <Nav.Link href="/mypage" className="path">마이페이지</Nav.Link>
            {userRole === "[ROLE_ADMIN]" && (
              <Nav.Link href="/admin/userList" className="path">회원관리</Nav.Link>
            )}
            {userRole === "[ROLE_ADMIN]" && (
              <Nav.Link href="/admin/recommendSet" className="path">추천여행지설정</Nav.Link>
            )}
            {userRole === "[ROLE_ADMIN]" && (
              <Nav.Link href="/admin/bannerSet" className="path">배너설정</Nav.Link>
            )}
            <Nav.Link href="#action2 action" className="path">Menu</Nav.Link>
            <div
              className="fauser path"
              onClick={isLoggedIn ? handleLogout : handleLogin}
            >
              <FontAwesomeIcon icon={faUser} />
              {isLoggedIn ? "로그아웃" : "로그인"}
            </div>
            {/* </div> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppLayout;
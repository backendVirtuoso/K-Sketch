import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AppLayout.style.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "../pages/Login";
import axios from "axios";

const AppLayout = () => {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추가

    // 컴포넌트가 마운트될 때 로컬스토리지에서 토큰을 확인하여 로그인 상태를 결정함
    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log(token);
        setIsLoggedIn(!!token); // 토큰이 존재하면 true, 없으면 false
    }, []);

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
        alert("로그인이 필요한 서비스입니다. 로그인하시겠습니까? ");
        navigate("/login");
    };

    // 로그아웃
    const handleLogout = async () => {
        // 로컬 스토리지에서 토큰 삭제
        alert("로그아웃하시겠습니까?");
        try {
            await axios.post("/api/logout");
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            navigate("/");
            console.log("토큰 사라짐? : ", localStorage.getItem("token"));
        } catch (error) {
            console.error("로그아웃 중 오류 발생 : ", error);
        }
    };
 
    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container fluid> 
                <Navbar.Brand href="#" onClick={gotohome}>
                    Navbar scroll
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                    <Form className="d-flex">
                        <Form.Control
                            type="search"
                            placeholder="Search"
                            className="me-2 searchform-layout searchform-layout2"
                            aria-label="Search"
                        />
                        <Button variant="outline-info" className="searchform-layout">
                            Search
                        </Button>
                    </Form>
                    <Nav
                        className="me-auto my-2 my-lg-0 navbarstyle"
                        style={{ maxHeight: "200px", width: "100%" }}
                        navbarScroll
                    >
                        {/* <div className="navlink"> */}
                        {/* <Nav.Link href="/kafka">채팅</Nav.Link> */}
                        <Nav.Link onClick={isLoggedIn ? kafkaChatPage : error}>
                            채팅
                        </Nav.Link>
                        <Nav.Link href="/tmappath">길찾기</Nav.Link>
                        <Nav.Link href="/festival">페스티벌</Nav.Link>
                        <Nav.Link href="#action2 action">Menu</Nav.Link>
                        <Nav.Link href="#action2 action">Menu</Nav.Link>
                        <div
                            className="fauser"
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

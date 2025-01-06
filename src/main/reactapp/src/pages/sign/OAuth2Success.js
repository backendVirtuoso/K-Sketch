import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmModal } from "../../reducer/confirmModal";
import { useDispatch } from "react-redux";
import axios from "axios";

export default function OAuth2Success() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 컨펌모달 매서드
    const confirmModalMethod = (msg, msg2) => {
        const obj = {
            isConfirmModal2: true,
            isMsg: msg, 
            isMsg2: msg2
        };
        dispatch(confirmModal(obj));
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const username = params.get("username");

        if (token && username) {
            localStorage.setItem("token", token);
            localStorage.setItem("username", username);

            axios
                .get("http://localhost:8080/api/userinfo", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    const data = response.data;
                    const birthDate = data.birth;

                    if (birthDate) {
                        console.log("생일 있음");
                        navigate("/");
                        window.location.reload();
                    } else if (birthDate === null || birthDate === "") {
                        navigate("/socialSignUp");
                    } else {
                        console.error("예상치 못한 상태입니다.");
                        navigate("/signin");
                    }
                })
                .catch((err) => {
                    console.error("사용자 정보 요청 실패:", err);
                    navigate("/signin");
                });
        } else {
            console.error("토큰 또는 사용자 정보가 없습니다.");
            navigate("/signin");
        }
    }, [location, navigate, dispatch]);

    return <div>로그인 처리 중...</div>;
}

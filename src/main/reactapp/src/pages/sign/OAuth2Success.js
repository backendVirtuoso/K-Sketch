import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OAuth2Success() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // URL에서 token과 username 추출
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const username = params.get("username");

        if (token && username) {
            // 로컬 스토리지에 저장
            localStorage.setItem("token", token);
            localStorage.setItem("username", username);

            console.log("로그인 성공! 사용자:", username);
            navigate("/"); // 홈으로 이동
            window.location.reload();
        } else {
            console.error("토큰 또는 사용자 정보가 없습니다.");
            navigate("/signin"); // 로그인 페이지로 이동
        }
    }, [location, navigate]);

    return <div>로그인 처리 중...</div>;
}

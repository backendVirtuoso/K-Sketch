import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MyPage.style.css"; // CSS는 외부 파일로 관리합니다.

const Mypage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [travelData, setTravelData] = useState([]); // 여행 데이터 상태 추가

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .get("http://localhost:8080/api/userinfo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUserInfo(response.data);
          setTravelData(response.data.travels || []); // travels 키에 여행 데이터가 있다고 가정
          setLoading(false);
        })
        .catch((err) => {
          console.error("사용자 정보 요청 실패:", err);
          setError("사용자 정보를 불러오는 데 실패했습니다.");
          setLoading(false);
        });
    } else {
      setError("로그인이 필요합니다.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("로그아웃 되었습니다.");
    window.location.href = "/login";
  };

  return (
    <div className="mypage-container">
      <h2>마이페이지</h2>
      {userInfo ? (
        <div>
          <p>
            <strong>Login ID:</strong> {userInfo.loginId}
          </p>
          <p>
            <strong>이름:</strong> {userInfo.name}
          </p>
          <div className="timeline-container">
            <div className="timeline">
              {travelData.length > 0 ? (
                travelData.map((travel, index) => (
                  <div
                    key={index}
                    className="timeline-item"
                    style={{ left: `${index * 20}%` }} // 아이템 위치 조정
                  >
                    {travel.location}
                  </div>
                ))
              ) : (
                <p>여행 데이터가 없습니다.</p>
              )}
              {/* 마리오 */}
              <div
                className="mario-container"
                style={{
                  left: `${Math.min(travelData.length, 4) * 20}%`, // 마리오 위치 동적 계산
                }}
              >
                <img
                  src="https://w7.pngwing.com/pngs/860/771/png-transparent-luigi-super-mario-bros-pixel-art-luigi-angle-text-super-mario-bros-thumbnail.png"
                  alt="마리오"
                  className="mario"
                />
                {/* 말풍선 */}
                <div className="speech-bubble">
                  <p>
                    {travelData.length > 0
                      ? `여행 ${travelData.length}개 완료!`
                      : "여행을 시작하세요!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>사용자 정보가 없습니다.</div>
      )}
      <button className="btn btn-link" onClick={handleLogout}>
        로그아웃
      </button>
    </div>
  );
};

export default Mypage;

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import SignIn from "./pages/sign/SignIn";
import OAuth2Success from "./pages/sign/OAuth2Success";
import SignUp from "./pages/sign/SignUp";
import SocialSignUp from "./pages/sign/SocialSignUp";
import UserIdSearch from "./pages/sign/UserIdSearch";
import UserPwSearch from "./pages/sign/UserPwSearch";
import IdSearchCom from "./pages/sign/IdSearchCom";
import PwSearchCom from "./pages/sign/PwSearchCom";
import IdSearchResult from "./pages/sign/IdSearchResult";
import PwSearchResult from "./pages/sign/PwSearchResult";
import { Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./component/AppLayout";
import Home from "./pages/home/Home";
import Weather from "./pages/weather/Weather";
import Wayto from "./pages/wayto/Wayto";
import Like from "./pages/like/Like";
import Room from "./pages/chat/Room";
import RoomDetail from "./pages/chat/RoomDetail";
import ScheduleTmap from "./pages/schedule/ScheduleTmap";
import ConfirmModalComponent from "./pages/ConfirmModalComponent";
import QuickMenuComponent from "./pages/QuickMenuComponent";
import TravelList from "./pages/travel/TravelList";
import TravelDetail from "./pages/travel/traveldetail/TravelDetail";
import ApiPlaces from "./pages/place/ApiPlaces";
import MyPage from "./pages/mypage/MyPage";
import UserInfoModify from "./pages/mypage/UserInfoModify";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminUserInfoEdit from "./pages/admin/AdminUserInfoEdit";
import AdminBannerSet from "./pages/admin/AdminBannerSet";

// FontAwesome 라이브러리 초기화
library.add(fas, far, fab);

const App = () => {
  const selector = useSelector((state) => state);
  const dispatch = useDispatch();

  return (
    <div>
      <AppLayout />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/oauth2/success" element={<OAuth2Success />} />
        <Route path="/socialSignUp" element={<SocialSignUp />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/userIdSearch" element={<UserIdSearch />} />
        <Route path="/userPwSearch" element={<UserPwSearch />} />
        <Route path="/IdSearchEmailAuthentication" element={<IdSearchCom />} />
        <Route path="/PwSearchEmailAuthentication" element={<PwSearchCom />} />
        <Route path="/idSearchResult" element={<IdSearchResult />} />
        <Route path="/pwSearchResult" element={<PwSearchResult />} />
        <Route path="weather" element={<Weather />} />
        <Route path="wayto" element={<Wayto />} />
        <Route path="like" element={<Like />} />
        <Route path="/places" element={<ApiPlaces />} />
        <Route path="/kafka" element={<Room />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/userInfoModify" element={<UserInfoModify />} />
        <Route path="/admin/userList" element={<AdminUserManagement />} />
        <Route path="/admin/edit/:loginId" element={<AdminUserInfoEdit />} />
        <Route path="/admin/bannerSet" element={<AdminBannerSet />} />
        <Route
          path="/api/kafkachat/room/enter/:roomId"
          element={<RoomDetail />}
        />
        <Route path="/schedule">
          <Route index element={<ScheduleTmap />} />
          <Route path=":tripId" element={<ScheduleTmap />} />
        </Route>
        <Route path="travelwith">
          <Route index element={<TravelList />} />
          <Route path=":id" element={<TravelDetail />} />
        </Route>
      </Routes>
      {selector.confirmModal.isConfirmModal && <ConfirmModalComponent />}
      <QuickMenuComponent />

      <Outlet />
    </div>
  );
};

export default App;

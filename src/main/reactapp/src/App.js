import React from "react";
import { useSelector, useDispatch } from "react-redux";
import SignIn from "./pages/sign/SignIn";
import SignUp from "./pages/sign/SignUp";
import { Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./component/AppLayout";
import Home from "./pages/home/Home";
import Weather from "./pages/weather/Weather";
import Wayto from "./pages/wayto/Wayto";
import Like from "./pages/like/Like";
import Room from "./pages/chat/Room";
import RoomDetail from "./pages/chat/RoomDetail"; 
import TmapPath from "./pages/tmap/TmapPath";
import ConfirmModalComponent from "./pages/ConfirmModalComponent";
import QuickMenuComponent from "./pages/QuickMenuComponent";

import TravelList from "./pages/travel/TravelList";
import TravelDetail from "./pages/travel/traveldetail/TravelDetail";
import ApiPlaces from "./pages/place/ApiPlaces"; 
import Path from "./pages/tmap/Path";
import MyPage from "./pages/mypage/MyPage"; 
 
  
const App = () => {
  const selector = useSelector((state) => state);
  const dispatch = useDispatch();

  return (
    <div>
      <AppLayout />
      <Routes>     
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="weather" element={<Weather />} />
        <Route path="wayto" element={<Wayto />} />
        <Route path="like" element={<Like />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/places" element={<ApiPlaces />} />
        <Route path="/kafka" element={<Room />} />
        <Route path="/mypage" element={<MyPage/>}/>
        <Route 
          path="/api/kafkachat/room/enter/:roomId"
          element={<RoomDetail />}
        />
        <Route path="/tmappath" element={<TmapPath />} />
        <Route path="/path" element={<Path />} />
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

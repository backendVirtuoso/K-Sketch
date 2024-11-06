import React from 'react'
import Login from './pages/Login'
import { Outlet, Route, Routes } from 'react-router-dom'
import AppLayout from './component/AppLayout'
import Home from './pages/home/Home'
import Weather from './pages/weather/Weather'
import Wayto from './pages/wayto/Wayto'
import Like from './pages/like/Like'
import UserRegistForm from './pages/UserRegistForm'
import Festival from './pages/festival/Festival'
import Room from './pages/chat/Room'
import RoomDetail from './pages/chat/RoomDetail'
import TmapPath from './pages/tmap/TmapPath'

const App = () => {
  return (
    <div>
      <AppLayout />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="weather" element={<Weather />} />
        <Route path="wayto" element={<Wayto />} />
        <Route path="like" element={<Like />} />
        <Route path="/signup" element={<UserRegistForm />} />
        <Route path="/festival" element={<Festival />} />
        <Route path="/kafka" element={<Room />} />
        <Route path="/api/kafkachat/room/enter/:roomId" element={<RoomDetail />} />
        <Route path="/tmappath" element={<TmapPath />} />
      </Routes>
      <Outlet />
    </div>
  )
}

export default App
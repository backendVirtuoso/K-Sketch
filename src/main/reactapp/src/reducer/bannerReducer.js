import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

const bannerReducer = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    addBanner: (state, action) => {
      state.push(action.payload); // 이미지 URL 또는 Base64 데이터 추가
    },
    deleteBanner: (state, action) => {
      return state.filter((_, index) => index !== action.payload); // 특정 배너 삭제
    },
  },
});

export const { addBanner, deleteBanner } = bannerReducer.actions;
export default bannerReducer.reducer;

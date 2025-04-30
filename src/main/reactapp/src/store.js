import { configureStore } from '@reduxjs/toolkit';
import confirmModal from './reducer/confirmModal.js';
import bannerReducer from './reducer/bannerReducer.js';

const store = configureStore({
  reducer: {
    confirmModal,
    banners: bannerReducer,
  }
});

export default store; 
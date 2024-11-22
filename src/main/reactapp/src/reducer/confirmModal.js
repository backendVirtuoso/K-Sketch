import { createSlice } from "@reduxjs/toolkit";

const initState = {
    isConfirmModal: false,
    isMsg: '',
    isMsg2: ''
}

const confirmModallReducer = createSlice({
    name: 'confirmModal',
    initialState: initState,
    reducers: {
        confirmModal: (state, action) => {
            state.isConfirmModal = action.payload.isConfirmModal;
            state.isMsg = action.payload.isMsg;
            state.isMsg2 = action.payload.isMsg2;
        }
    }
});

export default confirmModallReducer.reducer;
export const { confirmModal } = confirmModallReducer.actions;
'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  userInfo: {
    access_token: string,
    email: string
  }
}

const initialState: UserState = {
  userInfo: {
    access_token: '',
    email: ''
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{userInfo: { access_token: string; email: string } }>) => {
      state.userInfo = action.payload.userInfo;
    },
    clearUser: (state) => {
      state.userInfo = {access_token: '', email: ''};
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;

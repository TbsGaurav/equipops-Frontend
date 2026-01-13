import { createSlice } from '@reduxjs/toolkit';
import cookie from 'react-cookies';

const userSlice = createSlice({
    name: 'user',
    initialState: { user: null, isLogin: false, permissions: [], subscription: [] },
    reducers: {
        setUser: (state, { payload }) => {
            state.user = payload;
            state.permissions = payload.menuPermissions || [];
            state.subscription = payload.subscription || [];
            state.isLogin = true;
        },
        clearUser: (state) => {
            state.user = null;
            state.permissions = [];
            state.subscription = [];
            state.isLogin = false;
            cookie.remove('accessKey');
        }
    }
});
export const { setUser, clearUser } = userSlice.actions;
export default userSlice;

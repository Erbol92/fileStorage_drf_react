import { createSlice } from "@reduxjs/toolkit";
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ["error","errorAccess","loading","isAuth"]
};

const initialData = {
    loading: false,
    error: null,
    isAuth: false,
    isStaff: false,
    access: null,
    errorAccess: false,
    username: '',
}

const authSlice = createSlice({
    name: 'auth',
    initialState: initialData,
    reducers: {
        // аутентификация
        loginRequest: (state, action) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.username = action.payload.username;
            state.isStaff = action.payload.is_staff;
            state.access = action.payload.access;
            state.isAuth = true;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuth = false;
        },
        // логаут
        logoutRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.access = null;
            state.isAuth = false;
        },
        logoutSuccess: (state) => {
            state.loading = false;
            state.isAuth = false;
            state.username = null;
            state.isStaff = false;
            state.error = null;
            state.access = null;
            state.errorAccess = null;
        },
        logoutFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            // Даже при ошибке API, на клиенте разлогиниваем
            state.isAuth = false;
            state.username = null;
            state.isStaff = false;
        },
        // проверка токенов
        checkAuthRequest: (state, action) => {
            state.loading = true;
            state.errorAccess = null;
        },
        checkAuthSuccess: (state, action) => {
            state.loading = false;
            state.isAuth = true;
        },
        checkAuthFailure: (state, action) => {
            state.loading = false;
            state.errorAccess = action.payload;
            state.isAuth = false;
        },
        setAccess: (state, action) => {
            state.access = action.payload.access
            state.isAuth = true;
        }
    }
})


export const authActions = authSlice.actions;

export const persistedAuthReducer = persistReducer(
  authPersistConfig,
  authSlice.reducer,
);
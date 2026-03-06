import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from 'redux-persist';


const initialData = {
    loading: false,
    error: null,
    users: [],
}

export const adminSlice = createSlice({
    name: 'admin',
    initialState: initialData,
    reducers: {
        // аутентификация
        usersRequest: (state, action) => {
            state.loading = true;
            state.error = null;
        },
        usersSuccess: (state, action) => {
            state.loading = false;
            state.users = action.payload;
        },
        usersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    }
})

export const adminActions = adminSlice.actions;
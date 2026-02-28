import { createSlice } from "@reduxjs/toolkit";

const initialData = {
    loading: false,
    error: null,
    isPreRegister: false,
    message: null,
}

export const registerSlice = createSlice({
    name: 'register',
    initialState: initialData,
    reducers: {
        // регистрация
        registerRequest: (state, action) => {
            state.loading = true;
            state.error = null;
        },
        registerSuccess: (state, action) => {
            state.loading = false;
            state.isPreRegister = true;
            state.message = action.payload.message;
            state.error = action.payload.errors;
        },
        registerFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isPreRegister = false;
        },
    }
})


export const registerActions = registerSlice.actions;
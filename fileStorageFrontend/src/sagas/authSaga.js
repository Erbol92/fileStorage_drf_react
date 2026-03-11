import { put, takeLatest, spawn, call } from 'redux-saga/effects'
import { authActions } from '../slices/authSlice';
import { CONFIG } from '../config';


function* loginRequest(action) {
    try {
        const body = JSON.stringify(action.payload);
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body,
            credentials: "include",
        };
        const response = yield call(fetch, `${CONFIG.API_URL}/token/`, params);
        const data = yield response.json();
        if (response.ok) {
            yield put(authActions.loginSuccess(data));
        } else {
            yield put(authActions.loginFailure(data.detail));
        }
    } catch (error) {
        yield put(authActions.loginFailure(error.message));
    }
}

export function* watchAuth() {
    yield takeLatest(authActions.loginRequest.type, loginRequest);
}


function* logoutRequest(action) {
    try {
        const access = action.payload;
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access}`
            },
            credentials: "include",
            mode: "cors",
        };
        const response = yield call(fetch, `${CONFIG.API_URL}/logout/`, params);
        
        if (response.ok) yield put(authActions.logoutSuccess());
    } catch (error) {
        yield put(authActions.logoutFailure(error.message));
    }
}

export function* watchLogout() {
    yield takeLatest(authActions.logoutRequest.type, logoutRequest);
}

function* checkAuthRequest(action) {
    try {
        const body = JSON.stringify(action.payload);
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body,
            credentials: "include",
            mode: "cors",
        };
        const response = yield call(fetch, `${CONFIG.API_URL}/token/verify/`, params);
        if (response.ok) {
            yield put(authActions.checkAuthSuccess());
            return
        }
        console.log(response.status)
        if (response.status == 401 ) {
            const refreshResponse = yield call(fetch, `${CONFIG.API_URL}/token/refresh/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                mode: "cors",
            });
            const data = yield refreshResponse.json();
            if (refreshResponse.ok) 
                yield put(authActions.setAccess(data));
            else
                yield put(authActions.checkAuthFailure(data.detail));
        }
        
    } catch (error) {
        yield put(authActions.checkAuthFailure(error.message));
    }
}

export function* watchCheckAuth() {
    yield takeLatest(authActions.checkAuthRequest.type, checkAuthRequest);
}


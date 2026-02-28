import { put, takeLatest, spawn, call } from 'redux-saga/effects'
import { registerActions } from '../slices/registerSlice';
import { CONFIG } from '../config';


function* registerRequest(action) {
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
        const response = yield call(fetch, `${CONFIG.API_URL}/register/`, params);
        const data = yield response.json();
        yield put(registerActions.registerSuccess(data));
    } catch (error) {
        yield put(registerActions.registerFailure(error.message));
    }
}

export function* watchReg() {
    yield takeLatest(registerActions.registerRequest.type, registerRequest);
}


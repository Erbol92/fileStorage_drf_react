import { call, put, takeLatest, all } from 'redux-saga/effects';
import * as api from '../api/adminApi';
import { adminActions } from '../slices/adminSlice';

function* fetchUsersSaga() {
  try {
    const users = yield call(api.fetchUsers);
    yield put(adminActions.usersSuccess(users));
  } catch (error) {
    yield put(adminActions.usersFailure(error.message));
  }
}

// Watchers
export function* watchFetchUsers() {
  yield takeLatest(adminActions.usersRequest.type, fetchUsersSaga);
}
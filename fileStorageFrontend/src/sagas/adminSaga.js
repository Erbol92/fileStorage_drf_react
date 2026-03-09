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

function* changeUserPermissionSaga(action) {
  try {
    const user = yield call(api.changeUserPermission, action.payload);
    yield put(adminActions.changePermissionSuccess(user));
  } catch (error) {
    yield put(adminActions.usersFailure(error.message));
  }
}

function* deleteUserSaga(action) {
  try {
    const userId = yield call(api.deleteUser, action.payload);
    yield put(adminActions.deleteUserSuccess(userId));
  } catch (error) {
    yield put(adminActions.usersFailure(error.message));
  }
}

// Watchers
export function* watchFetchUsers() {
  yield takeLatest(adminActions.usersRequest.type, fetchUsersSaga);
}

export function* watchChangeUserPermission() {
  yield takeLatest(adminActions.changePermissionRequest.type, changeUserPermissionSaga);
}

export function* watchDeleteUser() {
  yield takeLatest(adminActions.deleteUserRequest.type, deleteUserSaga);
}
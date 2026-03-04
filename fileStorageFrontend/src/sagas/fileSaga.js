import { call, put, takeLatest, all } from 'redux-saga/effects';
import * as api from '../api/fileApi';
import {
  fetchFilesRequest,
  fetchRootRequest,
  fetchFolderContentRequest,
  uploadFileRequest,
  createFolderRequest,
  deleteItemRequest,
  moveItemRequest,
  searchFilesRequest,
  fetchFilesSuccess,
  uploadFileSuccess,
  createFolderSuccess,
  deleteItemSuccess,
  moveItemSuccess,
  searchFilesSuccess,
  fetchFilesFailure,
  setUploadProgress,
  renameItemRequest,
  renameItemSuccess,
  shareItemRequest,
  shareItemSuccess,
} from '../slices/fileSlice';
import { authActions } from '../slices/authSlice';

function* fetchRootSaga() {
  try {
    const files = yield call(api.fetchRoot);
    yield put(fetchFilesSuccess({ 
      files, 
      currentFolder: null,
      breadcrumbs: [] 
    }));
  } catch (error) {
    if (error.response && error.response.status === 401) {
      try {
        const requestAccessToken = yield call(api.fetchAccessToken);
        yield put(authActions.setAccess(requestAccessToken));
        // повторная попытка оригинального запроса
        const files = yield call(api.fetchRoot);
        yield put(fetchFilesSuccess({ 
          files, 
          currentFolder: null,
          breadcrumbs: [] 
        }));
        return;
      } catch (refreshError) {
        yield put(fetchFilesFailure(refreshError.message));
        return;
      }
    }
    yield put(fetchFilesFailure(error.message));
  }
}

function* fetchFolderContentSaga(action) {
  const { folderId, folderName, breadcrumbs } = action.payload;
  try {
    
    const files = yield call(api.fetchFolderContent, folderId);
      yield put(fetchFilesSuccess({ 
        files, 
        currentFolder: { id: folderId, name: folderName },
        breadcrumbs 
      }));

  } catch (error) {
    if (error.response && error.response.status === 401) {
      try {
        const requestAccessToken = yield call(api.fetchAccessToken);
        yield put(authActions.setAccess(requestAccessToken));
        // повторная попытка оригинального запроса
        const files = yield call(api.fetchFolderContent, folderId);
        yield put(fetchFilesSuccess({
          files,
          currentFolder: { id: folderId, name: folderName },
          breadcrumbs
        }));
        return;
      } catch (refreshError) {
        yield put(fetchFilesFailure(refreshError.message));
        return;
      }
    }
    yield put(fetchFilesFailure(error.message));
  }
}

function* uploadFileSaga(action) {
  const { file, parentId, comment, onProgress } = action.payload;
  const progressCallback = (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(file.name, percentCompleted);
    };
  try {
    // Создаем кастомный колбек для прогресса
    const uploadedFile = yield call(api.uploadFile, file, parentId, comment, progressCallback);
    yield put(uploadFileSuccess(uploadedFile));
  } catch (error) {
    if (error.response && error.response.status === 401) {
      try {
        const requestAccessToken = yield call(api.fetchAccessToken);
        yield put(authActions.setAccess(requestAccessToken));
        // повторная попытка оригинального запроса
        const uploadedFile = yield call(api.uploadFile, file, parentId, comment, progressCallback);
        yield put(uploadFileSuccess(uploadedFile));
        return;
      } catch (refreshError) {
        yield put(fetchFilesFailure(refreshError.message));
        return;
      }
    }
    yield put(fetchFilesFailure(error.message));
  }
}

function* createFolderSaga(action) {
  try {
    const { name, parentId } = action.payload;
    const folder = yield call(api.createFolder, name, parentId);
    yield put(createFolderSuccess(folder));
  } catch (error) {
    yield put(fetchFilesFailure(error.message));
  }
}

function* deleteItemSaga(action) {
  try {
    yield call(api.deleteItem, action.payload);
    yield put(deleteItemSuccess(action.payload));
  } catch (error) {
    yield put(fetchFilesFailure(error.message));
  }
}

function* moveItemSaga(action) {
  const { itemId, parentId } = action.payload;
  try {
    const movedItem = yield call(api.moveItem, itemId, parentId);
    yield put(moveItemSuccess(movedItem));
    
    // Обновляем текущую папку после перемещения
    const currentFolderId = action.payload.currentFolderId;
    if (currentFolderId) {
      yield put(fetchFolderContentRequest({ 
        folderId: currentFolderId,
        folderName: action.payload.currentFolderName,
        breadcrumbs: action.payload.breadcrumbs
      }));
    } else {
      yield put(fetchRootRequest());
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      try {
        const requestAccessToken = yield call(api.fetchAccessToken);
        yield put(authActions.setAccess(requestAccessToken));
        // повторная попытка оригинального запроса
        const movedItem = yield call(api.moveItem, itemId, parentId);
        yield put(moveItemSuccess(movedItem));
        
        // Обновляем текущую папку после перемещения
        const currentFolderId = action.payload.currentFolderId;
        if (currentFolderId) {
          yield put(fetchFolderContentRequest({ 
            folderId: currentFolderId,
            folderName: action.payload.currentFolderName,
            breadcrumbs: action.payload.breadcrumbs
          }));
        } else {
          yield put(fetchRootRequest());
        }
        return;
      } catch (refreshError) {
        yield put(fetchFilesFailure(refreshError.message));
        return;
      }
    }
    yield put(fetchFilesFailure(error.message));
  }
}

function* searchFilesSaga(action) {
  try {
    const files = yield call(api.searchFiles, action.payload);
    yield put(searchFilesSuccess(files));
  } catch (error) {
    yield put(fetchFilesFailure(error.message));
  }
}

function* renameItemSaga(action) {
  try {
    const file = yield call(api.renameItem, action.payload);
    yield put(renameItemSuccess(file));
  } catch (error) {
    yield put(fetchFilesFailure(error.message));
  }
}

function* shareItemSaga(action) {
  try {
    const file = yield call(api.shareItem, action.payload);
    // if (file.status==201) {
      // const link = yield call(api.getShareLink, file.data.uid);
      yield put(shareItemSuccess(file))
    // }
      
  } catch (error) {
    yield put(fetchFilesFailure(error.message));
  }
}

// Watchers
export function* watchFetchRoot() {
  yield takeLatest(fetchRootRequest.type, fetchRootSaga);
}

export function* watchFetchFolderContent() {
  yield takeLatest(fetchFolderContentRequest.type, fetchFolderContentSaga);
}

export function* watchUploadFile() {
  yield takeLatest(uploadFileRequest.type, uploadFileSaga);
}

export function* watchCreateFolder() {
  yield takeLatest(createFolderRequest.type, createFolderSaga);
}

export function* watchDeleteItem() {
  yield takeLatest(deleteItemRequest.type, deleteItemSaga);
}

export function* watchMoveItem() {
  yield takeLatest(moveItemRequest.type, moveItemSaga);
}

export function* watchSearchFiles() {
  yield takeLatest(searchFilesRequest.type, searchFilesSaga);
}

export function* watchRenameItem() {
  yield takeLatest(renameItemRequest.type, renameItemSaga);
}

export function* watchShareItem() {
  yield takeLatest(shareItemRequest.type, shareItemSaga);
}
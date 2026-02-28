import { all } from 'redux-saga/effects';
import { watchAuth,watchCheckAuth,watchLogout } from './authSaga';
import { watchReg } from './registerSaga';
import { watchCreateFolder, watchDeleteItem, watchFetchFolderContent, watchFetchRoot, watchMoveItem, watchSearchFiles, watchUploadFile } from './fileSaga';

export function* rootSaga() {
    yield all([
        watchAuth(),
        watchLogout(),
        watchCheckAuth(),
        watchReg(),
        watchFetchRoot(),
        watchFetchFolderContent(),
        watchUploadFile(),
        watchCreateFolder(),
        watchDeleteItem(),
        watchMoveItem(),
        watchSearchFiles()
      ]);
}
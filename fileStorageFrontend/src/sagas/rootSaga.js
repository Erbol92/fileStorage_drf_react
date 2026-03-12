import { all } from 'redux-saga/effects';
import { watchAuth,watchCheckAuth,watchLogout } from './authSaga';
import { watchReg } from './registerSaga';
import { watchCommentItem, watchRenameItem, watchCreateFolder, watchDeleteItem, watchFetchFolderContent, watchFetchRoot, watchMoveItem, watchSearchFiles, watchUploadFile, watchShareItem } from './fileSaga';
import { watchFetchUsers, watchChangeUserPermission, watchDeleteUser } from './adminSaga';

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
        watchSearchFiles(),
        watchRenameItem(),
        watchShareItem(),
        watchCommentItem(),
        watchFetchUsers(),
        watchChangeUserPermission(),
        watchDeleteUser(),
      ]);
}
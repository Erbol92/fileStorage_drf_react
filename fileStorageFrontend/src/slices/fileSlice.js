import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  files: [],
  currentFolder: null,
  breadcrumbs: [],
  loading: false,
  error: null,
  uploadProgress: {},
  selectedFiles: [],
  moveModal: {
    isOpen: false,
    item: null
  },
  createFolderModal: {
    isOpen: false,
    parentId: null
  }
};

export const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    // Запросы
    fetchFilesRequest: (state, action) => {
      state.loading = true;
      state.error = null;
    },
    fetchRootRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFolderContentRequest: (state, action) => {
      state.loading = true;
      state.error = null;
    },
    uploadFileRequest: (state, action) => {
      state.loading = true;
      state.error = null;
    },
    createFolderRequest: (state, action) => {
      state.loading = true;
      state.error = null;
    },
    deleteItemRequest: (state, action) => {
      state.loading = true;
      state.error = null;
    },
    moveItemRequest: (state, action) => {
      state.loading = true;
      state.error = null;
    },
    searchFilesRequest: (state, action) => {
      state.loading = true;
      state.error = null;
    },

    // Успешные ответы
    fetchFilesSuccess: (state, action) => {
      state.loading = false;
      state.files = action.payload.files;
      state.currentFolder = action.payload.currentFolder;
      state.breadcrumbs = action.payload.breadcrumbs || [];
    },
    uploadFileSuccess: (state, action) => {
      state.loading = false;
      state.files.push(action.payload);
      delete state.uploadProgress[action.payload.name];
    },
    createFolderSuccess: (state, action) => {
      state.loading = false;
      state.files.push(action.payload);
      state.createFolderModal.isOpen = false;
    },
    deleteItemSuccess: (state, action) => {
      state.loading = false;
      state.files = state.files.filter(file => file.id !== action.payload);
    },
    moveItemSuccess: (state, action) => {
      state.loading = false;
      state.moveModal.isOpen = false;
      state.moveModal.item = null;
      // Обновляем список файлов если нужно
    },
    searchFilesSuccess: (state, action) => {
      state.loading = false;
      state.files = action.payload;
    },

    // Ошибки
    fetchFilesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // UI действия
    setUploadProgress: (state, action) => {
      const { fileName, progress } = action.payload;
      state.uploadProgress[fileName] = progress;
    },
    selectFile: (state, action) => {
      const fileId = action.payload;
      if (!state.selectedFiles.includes(fileId)) {
        state.selectedFiles.push(fileId);
      }
    },
    deselectFile: (state, action) => {
      state.selectedFiles = state.selectedFiles.filter(id => id !== action.payload);
    },
    clearSelection: (state) => {
      state.selectedFiles = [];
    },
    openMoveModal: (state, action) => {
      state.moveModal.isOpen = true;
      state.moveModal.item = action.payload;
    },
    closeMoveModal: (state) => {
      state.moveModal.isOpen = false;
      state.moveModal.item = null;
    },
    openCreateFolderModal: (state, action) => {
      state.createFolderModal.isOpen = true;
      state.createFolderModal.parentId = action.payload;
    },
    closeCreateFolderModal: (state) => {
      state.createFolderModal.isOpen = false;
      state.createFolderModal.parentId = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
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
  selectFile,
  deselectFile,
  clearSelection,
  openMoveModal,
  closeMoveModal,
  openCreateFolderModal,
  closeCreateFolderModal,
  clearError
} = fileSlice.actions;

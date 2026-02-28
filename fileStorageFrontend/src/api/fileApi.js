import axios from 'axios';
import { CONFIG } from '../config';
const API_URL = CONFIG.API_URL
import { store } from '../store';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Добавляем токен авторизации
// api.interceptors.request.use((config) => {
//   const raw = localStorage.getItem('persist:auth');
//   const parsed = JSON.parse(raw);
//   const token = typeof parsed.access === 'string' 
//         ? parsed.access.replace(/^"|"$/g, '') 
//         : parsed.access;
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// const getAccessTokenFromLS =()=>{
//   const raw = localStorage.getItem('persist:auth');
//   const parsed = JSON.parse(raw);
//   const token = typeof parsed.access === 'string' 
//         ? parsed.access.replace(/^"|"$/g, '') 
//         : parsed.access;
//   return `Bearer ${token}`
// }

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth?.access;
  console.log(token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchAccessToken = async()=>{
  const response = await api.post('/token/refresh/',{}, {
    withCredentials: true
  })
  return response.data
}

export const fetchRoot = async () => {
  const response = await api.get('/files/root/');
  return response.data;
};

export const fetchFolderContent = async (folderId) => {
  const response = await api.get(`/files/${folderId}/content/`);
  return response.data;
};

export const uploadFile = async (file, parentId, onProgress) => {
  const formData = new FormData();
  formData.append('name', file.name);
  formData.append('file', file);
  if (parentId) {
    formData.append('parent', parentId);
  }

  const response = await api.post('/files/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress
  });
  return response.data;
};

export const createFolder = async (name, parentId) => {
  const response = await api.post('/files/create_folder/', {
    name,
    parent: parentId
  });
  return response.data;
};

export const deleteItem = async (itemId) => {
  await api.delete(`/files/${itemId}/delete_item/`);
  return itemId;
};

export const moveItem = async (itemId, parentId) => {
  const response = await api.post(`/files/${itemId}/move/`, {
    parent: parentId
  });
  return response.data;
};

export const searchFiles = async (query) => {
  const response = await api.get(`/files/search/?q=${query}`);
  return response.data;
};
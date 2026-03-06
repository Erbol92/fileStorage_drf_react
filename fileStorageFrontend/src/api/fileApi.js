import { api } from "./apiRoot";

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

export const uploadFile = async (file, parentId, comment, onProgress) => {
  const formData = new FormData();
  formData.append('name', file.name);
  formData.append('file', file);
  formData.append('comment', comment);
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

export const renameItem = async ({itemId, name}) => {
  const response = await api.post(`/files/${itemId}/rename/`, {
    name
  });
  return response.data;
};

export const shareItem = async ({id, stop=false}) => {
  const response = await api.post(`/files/${id}/share/`,
    null, 
    {params: { "stop":stop} } 
);
  return response.data;
};

export const getShareLink = async (uuid) => {
  const response = await api.get(`/download`,{ params: { uuid } });
  return response.data.path;
};

export const downloadUserFile = async (itemId) => {
  const response = await api.get(`/download`, { 
    params: { "id": itemId },
    responseType: 'blob' 
  });
  return response.data;
};
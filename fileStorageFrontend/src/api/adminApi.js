import { api } from "./apiRoot";

export const fetchUsers = async () => {
  const response = await api.get('/users/');
  return response.data;
};

export const changeUserPermission = async ({userId, isStaff=null, isSuperUser=null}) => {
  const response = await api.post(`/users/${userId}/update_permissions/`, {
    is_staff: isStaff,
    is_superuser: isSuperUser
  });
  return response.data;
};
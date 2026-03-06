import { api } from "./apiRoot";

export const fetchUsers = async () => {
  const response = await api.get('/users/');
  console.log(response.data)
  return response.data;
};
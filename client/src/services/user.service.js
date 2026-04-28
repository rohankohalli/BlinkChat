import api from './api';

export const getUsers = () => api.get('/users');
export const getMe = () => api.get('/auth/me');

export const searchUsers = (q) => api.get(`/users/search?q=${q}`);

const userService = {
  getUsers,
  getMe,
  searchUsers
};

export default userService;

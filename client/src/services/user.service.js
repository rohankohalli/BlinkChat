import api from './api';

export const getUsers = () => api.get('/users');
export const getMe = () => api.get('/auth/me');

const userService = {
  getUsers,
  getMe
};

export default userService;

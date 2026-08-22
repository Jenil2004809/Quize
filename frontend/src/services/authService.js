import api from './api';

export const loginWithPassword = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const authService = {
  loginWithPassword,
  registerUser,
  logoutUser
};

export default authService;

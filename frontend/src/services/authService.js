import api from './api';

export const sendOTP = async (email) => {
  const response = await api.post('/auth/send-otp', { email });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
};

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
  sendOTP,
  verifyOTP,
  loginWithPassword,
  registerUser,
  logoutUser
};

export default authService;

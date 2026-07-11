import axios from 'axios';

export const ASSET_BASE_URL = import.meta.env.VITE_ASSET_URL || 'http://localhost:5005';

const api = axios.create({
  baseURL: `${ASSET_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inject token into headers automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized session, logging out...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // We can redirect to login if we are in browser environment and not on register/login pages
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

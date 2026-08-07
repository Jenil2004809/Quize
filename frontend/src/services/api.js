import axios from 'axios';

// Fast, Direct Local PC API URL Resolution
const getBackendURL = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    return `http://${host}:5005`;
  }
  return 'http://localhost:5005';
};

export const ASSET_BASE_URL = getBackendURL();

const api = axios.create({
  baseURL: `${ASSET_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inject JWT token into headers automatically
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
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

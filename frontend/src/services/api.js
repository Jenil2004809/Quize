import axios from 'axios';

// Dynamically resolve backend URL for local dev, Wi-Fi network, or cloud deployment
const getBackendURL = () => {
  if (import.meta.env.VITE_ASSET_URL) {
    return import.meta.env.VITE_ASSET_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5005';
    }
    // Wi-Fi network IP check (e.g., 192.168.x.x)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      return `http://${host}:5005`;
    }
    // Encrypted SSL API Gateway for remote mobile networks & public web domains
    return 'https://9a9f4902cc4d2d.lhr.life';
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
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

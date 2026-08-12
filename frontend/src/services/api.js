import axios from 'axios';

// Fast, Direct API URL Resolution (Local PC, Mobile Wi-Fi & Public Internet Tunnels)
const getBackendURL = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    // When accessed via public tunnel (loca.lt, trycloudflare, pinggy, etc.) or port 80/443, use relative path so Vite proxy forwards to backend
    if (
      host.includes('loca.lt') ||
      host.includes('trycloudflare.com') ||
      host.includes('pinggy') ||
      host.includes('serveo') ||
      window.location.port === '' ||
      window.location.port === '443' ||
      window.location.port === '80'
    ) {
      return '';
    }
    return `http://${host}:5005`;
  }
  return 'http://localhost:5005';
};

export const ASSET_BASE_URL = getBackendURL();

const api = axios.create({
  baseURL: ASSET_BASE_URL ? `${ASSET_BASE_URL}/api` : '/api',
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

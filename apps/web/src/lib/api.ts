/// <reference types="vite/client" />
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (
    isLocalhost
      ? 'http://localhost:4000/api'
      : 'https://vistral-pos-api.onrender.com/api'
  ),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Interceptor untuk menambahkan token JWT dari auth store
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor untuk handle 401 — auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

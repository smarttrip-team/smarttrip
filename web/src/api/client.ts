import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization token if available in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smarttrip_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

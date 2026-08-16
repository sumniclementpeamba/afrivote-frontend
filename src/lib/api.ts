import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000';

export const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
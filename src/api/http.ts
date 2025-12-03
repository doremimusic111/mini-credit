import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.DEV 
  ? '' // Use Vite proxy in development
  : (import.meta.env.VITE_API_BASE_URL || 'https://mini.sirch01.com'),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // optional if backend uses cookies/session
});

// Optional: global interceptor to log or handle errors
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
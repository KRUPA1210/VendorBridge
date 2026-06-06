// Central Axios-based API client for VendorBridge backend
// Backend base URL: http://localhost:8080/api/v1

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,       // JWT is in HttpOnly cookie — always send cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT from cookie automatically (withCredentials handles it)
// If you ever switch to localStorage token, uncomment below:
// api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//   const token = localStorage.getItem('vb_token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// Response interceptor — handle 401 globally (token expired → redirect to login)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vb_logged_in');
      localStorage.removeItem('vb_user');
      localStorage.removeItem('vb_current_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

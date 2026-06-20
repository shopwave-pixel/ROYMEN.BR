import axios from 'axios';
import { getToken, removeToken } from '../utils/token';

// Determine the API base URL. Prefers standard env, blocks to localhost:5000 dev fallback.
const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into headers if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally (e.g. 401 token invalidations)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Check if the error status is 401 (Unauthorized) and has not been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // If we got a 401, clear credentials on the client and propagate the issue
      removeToken();
      
      // We can also trigger a custom window-level event or redirect to login
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-expired'));
      }
    }
    
    // Normalize backend error message
    const message = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      'An unexpected API gateway error occurred.';
      
    // Create a normalized error object
    const normalizedError = new Error(message);
    (normalizedError as any).status = error.response?.status;
    (normalizedError as any).data = error.response?.data;
    
    return Promise.reject(normalizedError);
  }
);

export default api;

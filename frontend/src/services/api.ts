// Centralized API configuration and axios instance
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookie-based JWT
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage (fallback if cookies aren't working)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Only log errors, don't block the app
    if (error.response?.status === 401) {
      console.warn('Unauthorized access - using mock data fallback');
    } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      console.warn('Backend not available - using mock data fallback');
    } else {
      console.warn('API error:', error.message);
    }
    // Reject to allow try-catch in service functions
    return Promise.reject(error);
  }
);

export default apiClient;


import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // For sending cookies (e.g. refresh token)
});

// Request interceptor to add the access token
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop by checking if we already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Skip refresh for auth endpoints to prevent loops when logging in/signing up
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      try {
        const { data } = await axiosInstance.post('/auth/refresh');
        const newAccessToken = data.data.accessToken;

        // Update zustand store
        useAuthStore.getState().setAuth(useAuthStore.getState().user, newAccessToken);

        // Update authorization header and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid/expired
        useAuthStore.getState().clearAuth();
        // Option: Redirect to login or handle unauthenticated state globally via React Router
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

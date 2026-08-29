import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';
import useAuthStore from '../../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  
  return useMutation({
    mutationFn: async (credentials) => {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAuth(data.data.user, data.data.accessToken);
      }
    },
  });
};

export const useSignup = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (userData) => {
      const response = await axiosInstance.post('/auth/signup', userData);
      return response.data;
    },
    // Note: Signup does not immediately log the user in in the current backend flow, 
    // Wait, let's check: in walkthrough, it says "Now, log in with this user to get the accessToken".
    // So signup only creates the account. We don't setAuth here, we redirect to login or auto-login.
  });
};

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post('/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear(); // Clear all cached data
      navigate('/login');
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      clearAuth();
      queryClient.clear();
      navigate('/login');
    }
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (emailData) => {
      const response = await axiosInstance.post('/auth/forgot-password', emailData);
      return response.data;
    },
  });
};

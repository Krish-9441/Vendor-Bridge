import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

export const useNotifications = (params) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/notifications', { params });
      return response.data;
    },
    keepPreviousData: true,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await axiosInstance.get('/notifications/unread-count');
      return response.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.patch(`/notifications/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch('/notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useActivityLogs = (params) => {
  return useQuery({
    queryKey: ['activity-logs', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/activity-logs', { params });
      return response.data;
    },
    keepPreviousData: true,
  });
};

export const useActivityLogsForEntity = (entityType, entityId) => {
  return useQuery({
    queryKey: ['activity-logs', entityType, entityId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/activity-logs/${entityType}/${entityId}`);
      return response.data;
    },
    enabled: !!entityType && !!entityId,
  });
};

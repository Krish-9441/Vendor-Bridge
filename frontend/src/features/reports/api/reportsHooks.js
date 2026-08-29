import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['reports', 'dashboard-summary'],
    queryFn: async () => {
      const response = await axiosInstance.get('/reports/dashboard-summary');
      return response.data;
    }
  });
};

export const useSpendAnalytics = (filters = {}) => {
  return useQuery({
    queryKey: ['reports', 'spend', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/reports/spend', { params: filters });
      return response.data;
    }
  });
};

export const useVendorPerformance = () => {
  return useQuery({
    queryKey: ['reports', 'vendor-performance'],
    queryFn: async () => {
      const response = await axiosInstance.get('/reports/vendor-performance');
      return response.data;
    }
  });
};

export const useProcurementTrends = () => {
  return useQuery({
    queryKey: ['reports', 'trends'],
    queryFn: async () => {
      const response = await axiosInstance.get('/reports/trends');
      return response.data;
    }
  });
};

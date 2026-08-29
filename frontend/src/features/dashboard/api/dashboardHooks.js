import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const response = await axiosInstance.get('/reports/dashboard-summary');
      return response.data;
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

// Fetch paginated approvals list
export const useApprovals = (filters) => {
  return useQuery({
    queryKey: ['approvals', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/approvals', { params: filters });
      return response.data;
    },
    keepPreviousData: true,
  });
};

// Fetch approval details by ID
export const useApprovalById = (id) => {
  return useQuery({
    queryKey: ['approval', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/approvals/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Approve quotation
export const useApproveQuotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.post(`/approvals/${id}/approve`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['approval', id] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['rfq'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['quotation'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

// Reject quotation
export const useRejectQuotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, remarks }) => {
      const response = await axiosInstance.post(`/approvals/${id}/reject`, { remarks });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['approval', id] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['rfq'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['quotation'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

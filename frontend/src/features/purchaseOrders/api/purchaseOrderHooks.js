import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

// Fetch paginated POs list
export const usePurchaseOrders = (filters) => {
  return useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/purchase-orders', { params: filters });
      return response.data;
    },
    keepPreviousData: true,
  });
};

// Fetch PO details by ID
export const usePurchaseOrderById = (id) => {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/purchase-orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Generate PO from Approval
export const useGeneratePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (approvalId) => {
      const response = await axiosInstance.post('/purchase-orders', { approvalId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};

// Update PO Status (e.g. Acknowledge)
export const useUpdatePoStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await axiosInstance.patch(`/purchase-orders/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};

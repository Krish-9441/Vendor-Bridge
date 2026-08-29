import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

// Fetch paginated invoices list
export const useInvoices = (filters) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/invoices', { params: filters });
      return response.data;
    },
    keepPreviousData: true,
  });
};

// Fetch invoice details by ID
export const useInvoiceById = (id) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/invoices/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Generate Invoice from PO (Vendor only)
export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ purchaseOrderId, taxRate }) => {
      const response = await axiosInstance.post('/invoices', { purchaseOrderId, taxRate });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};

// Send Invoice via email (Vendor only)
export const useSendInvoiceEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.post(`/invoices/${id}/send`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

// Update Invoice status (Manager/Admin — mark as PAID)
export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await axiosInstance.patch(`/invoices/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

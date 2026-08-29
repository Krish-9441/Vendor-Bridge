import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

// Fetch paginated quotations list
export const useQuotations = (filters) => {
  return useQuery({
    queryKey: ['quotations', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/quotations', { params: filters });
      return response.data;
    },
    keepPreviousData: true,
  });
};

// Fetch quotation details by ID (if needed, but usually we list them or get via RFQ)
export const useQuotationById = (id) => {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/quotations/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create a new quotation
export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quoteData) => {
      const response = await axiosInstance.post('/quotations', quoteData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['rfq'] }); // Invalidate specific RFQ to show submitted status
    },
  });
};

// Update an existing quotation
export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.patch(`/quotations/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['rfq'] });
    },
  });
};

// Withdraw a quotation
export const useWithdrawQuotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.post(`/quotations/${id}/withdraw`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['rfq'] });
    },
  });
};

// Select a quotation (Procurement Officer)
export const useSelectQuotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.post(`/quotations/${id}/select`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['rfq'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};

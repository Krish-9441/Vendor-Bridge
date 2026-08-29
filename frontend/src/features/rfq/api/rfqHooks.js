import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

// Fetch paginated RFQs list
export const useRfqs = (filters) => {
  return useQuery({
    queryKey: ['rfqs', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/rfqs', { params: filters });
      return response.data;
    },
    keepPreviousData: true,
  });
};

// Fetch RFQ details by ID
export const useRfqById = (id) => {
  return useQuery({
    queryKey: ['rfq', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/rfqs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create a new DRAFT RFQ
export const useCreateRfq = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rfqData) => {
      const response = await axiosInstance.post('/rfqs', rfqData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    },
  });
};

// Update DRAFT RFQ
export const useUpdateRfq = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.patch(`/rfqs/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['rfq', id] });
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    },
  });
};

// Assign vendors to an RFQ
export const useAssignVendors = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, vendorIds }) => {
      const response = await axiosInstance.post(`/rfqs/${id}/vendors`, { vendorIds });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['rfq', id] });
    },
  });
};

// Publish RFQ
export const usePublishRfq = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.post(`/rfqs/${id}/publish`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rfq', id] });
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    },
  });
};

// Cancel RFQ
export const useCancelRfq = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const response = await axiosInstance.post(`/rfqs/${id}/cancel`, { reason });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['rfq', id] });
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    },
  });
};

// Upload attachment
export const useUploadRfqAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post(`/rfqs/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['rfq', id] });
    },
  });
};

// Compare Quotations
export const useCompareQuotations = (id) => {
  return useQuery({
    queryKey: ['rfq-compare', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/rfqs/${id}/compare`);
      return response.data;
    },
    enabled: !!id,
  });
};

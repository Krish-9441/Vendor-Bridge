import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

// Fetch paginated vendors list
export const useVendors = (filters) => {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/vendors', { params: filters });
      return response.data;
    },
    keepPreviousData: true,
  });
};

// Fetch vendor details by ID
export const useVendorDetails = (id) => {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/vendors/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create a new vendor
export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vendorData) => {
      const response = await axiosInstance.post('/vendors', vendorData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

// Update vendor status (Admin only)
export const useUpdateVendorStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await axiosInstance.patch(`/vendors/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', id] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../client';

export interface Notification {
  id: string;
  tenantId: string;
  type: 'STATIC' | 'DYNAMIC';
  title: string;
  message: string;
  targetRole: string[];
  createdAt: Date;
  delivered: boolean;
}

export const useNotifications = (client: ApiClient) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await client.get<{ success: boolean; data: Notification[] }>('/api/v1/notifications');
      return response.data;
    },
  });
};

export const useCreateNotification = (client: ApiClient) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Notification>) => {
      const response = await client.post<{ success: boolean; data: Notification }>('/api/v1/notifications', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

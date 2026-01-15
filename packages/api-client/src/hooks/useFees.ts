import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../client';

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: Date;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
  paidAmount: number;
  feeType: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useFees = (client: ApiClient, studentId?: string) => {
  return useQuery({
    queryKey: ['fees', studentId],
    queryFn: async () => {
      const response = await client.get<{ success: boolean; data: Fee[] }>(
        `/api/v1/fees${studentId ? `?studentId=${studentId}` : ''}`
      );
      return response.data;
    },
  });
};

export const useRecordPayment = (client: ApiClient) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { feeId: string; amount: number; paymentMethod: string; transactionId?: string }) => {
      const response = await client.post<{ success: boolean; data: any }>('/api/v1/fees/payment', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
  });
};

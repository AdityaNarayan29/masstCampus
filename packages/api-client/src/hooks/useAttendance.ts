import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../client';

export interface Attendance {
  id: string;
  studentId: string;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useAttendance = (client: ApiClient, date?: string) => {
  return useQuery({
    queryKey: ['attendance', date],
    queryFn: async () => {
      const response = await client.get<{ success: boolean; data: Attendance[] }>(
        `/api/v1/attendance${date ? `?date=${date}` : ''}`
      );
      return response.data;
    },
  });
};

export const useMarkAttendance = (client: ApiClient) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: string; date: string; status: Attendance['status']; remarks?: string }) => {
      const response = await client.post<{ success: boolean; data: Attendance }>('/api/v1/attendance', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};

export const useBulkMarkAttendance = (client: ApiClient) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { date: string; records: Array<{ studentId: string; status: Attendance['status'] }> }) => {
      const response = await client.post<{ success: boolean; data: Attendance[] }>('/api/v1/attendance/bulk', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};

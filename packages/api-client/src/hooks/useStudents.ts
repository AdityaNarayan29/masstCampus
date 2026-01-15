import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../client';

export interface Student {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  enrollmentNumber: string;
  gradeLevel: number;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  createdAt: Date;
  updatedAt: Date;
}

export const useStudents = (client: ApiClient, tenantId?: string) => {
  return useQuery({
    queryKey: ['students', tenantId],
    queryFn: async () => {
      const response = await client.get<{ success: boolean; data: Student[] }>('/api/v1/students');
      return response.data;
    },
    enabled: !!tenantId,
  });
};

export const useStudent = (client: ApiClient, id: string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const response = await client.get<{ success: boolean; data: Student }>(`/api/v1/students/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateStudent = (client: ApiClient) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Student>) => {
      const response = await client.post<{ success: boolean; data: Student }>('/api/v1/students', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useUpdateStudent = (client: ApiClient) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Student> }) => {
      const response = await client.patch<{ success: boolean; data: Student }>(`/api/v1/students/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
    },
  });
};

export const useDeleteStudent = (client: ApiClient) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/api/v1/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

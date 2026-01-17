import axios from 'axios';

/**
 * API client that automatically includes tenant headers
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add tenant header from current host
if (typeof window !== 'undefined') {
  apiClient.interceptors.request.use((config) => {
    config.headers['x-forwarded-host'] = window.location.host;
    return config;
  });
}

// Add auth token if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ============ API SERVICE FUNCTIONS ============

// Auth API
export const authApi = {
  login: async (email: string, password: string, tenantId?: string) => {
    const payload: { email: string; password: string; tenantId?: string } = { email, password };
    if (tenantId) {
      payload.tenantId = tenantId;
    }
    const response = await apiClient.post('/auth/login', payload);
    if (response.data.success && response.data.data.accessToken) {
      localStorage.setItem('auth_token', response.data.data.accessToken);
    }
    return response.data;
  },
  register: async (data: { email: string; password: string; firstName: string; lastName: string; role: string; tenantId: string }) => {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.success && response.data.data.accessToken) {
      localStorage.setItem('auth_token', response.data.data.accessToken);
    }
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    if (response.data.success && response.data.data.accessToken) {
      localStorage.setItem('auth_token', response.data.data.accessToken);
    }
    return response.data;
  },
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore errors, still clear local storage
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

// Students API
export const studentsApi = {
  getAll: async (params?: { gradeLevel?: string; search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/students', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/students', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/students/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },
};

// Teachers API
export const teachersApi = {
  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/teachers', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/teachers/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/teachers', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/teachers/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/teachers/${id}`);
    return response.data;
  },
};

// Classes API
export const classesApi = {
  getAll: async (params?: { gradeLevel?: string; teacherId?: string; search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/classes', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/classes/${id}`);
    return response.data;
  },
  getStudents: async (id: string) => {
    const response = await apiClient.get(`/classes/${id}/students`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/classes', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/classes/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/classes/${id}`);
    return response.data;
  },
};

// Attendance API
export const attendanceApi = {
  getAll: async (params?: { classId?: string; studentId?: string; date?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/attendance', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/attendance/${id}`);
    return response.data;
  },
  getClassStats: async (classId: string, date: string) => {
    const response = await apiClient.get(`/attendance/class/${classId}/stats`, { params: { date } });
    return response.data;
  },
  getStudentSummary: async (studentId: string, startDate?: string, endDate?: string) => {
    const response = await apiClient.get(`/attendance/student/${studentId}/summary`, { params: { startDate, endDate } });
    return response.data;
  },
  mark: async (data: { studentId: string; classId: string; date: string; status: string; notes?: string }) => {
    const response = await apiClient.post('/attendance/mark', data);
    return response.data;
  },
  bulkMark: async (data: { classId: string; date: string; records: Array<{ studentId: string; status: string; notes?: string }> }) => {
    const response = await apiClient.post('/attendance/bulk', data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/attendance/${id}`);
    return response.data;
  },
};

// Fees API
export const feesApi = {
  getAll: async (params?: { studentId?: string; status?: string; type?: string; academicYear?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/fees', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/fees/${id}`);
    return response.data;
  },
  getStats: async (academicYear?: string) => {
    const response = await apiClient.get('/fees/stats', { params: { academicYear } });
    return response.data;
  },
  getStudentSummary: async (studentId: string) => {
    const response = await apiClient.get(`/fees/student/${studentId}/summary`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/fees', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/fees/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/fees/${id}`);
    return response.data;
  },
  recordPayment: async (data: { feeId: string; studentId: string; amount: number; paymentMethod: string; transactionId?: string }) => {
    const response = await apiClient.post('/fees/payments', data);
    return response.data;
  },
  getPayments: async (params?: { studentId?: string; feeId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/fees/payments/all', { params });
    return response.data;
  },
};

// Brokers API
export const brokersApi = {
  getAll: async () => {
    const response = await apiClient.get('/brokers');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/brokers/${id}`);
    return response.data;
  },
  getHierarchy: async (id: string) => {
    const response = await apiClient.get(`/brokers/${id}/hierarchy`);
    return response.data;
  },
  getStats: async (id: string) => {
    const response = await apiClient.get(`/brokers/${id}/stats`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/brokers', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/brokers/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/brokers/${id}`);
    return response.data;
  },
};

// Parents API
export const parentsApi = {
  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/parents', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/parents/${id}`);
    return response.data;
  },
  getChildren: async (id: string) => {
    const response = await apiClient.get(`/parents/${id}/children`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/parents', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/parents/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/parents/${id}`);
    return response.data;
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async (params?: { role?: string }) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/notifications', data);
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
};

// Tenant API (Schools)
export const tenantApi = {
  resolve: async () => {
    const response = await apiClient.get('/tenants/resolve');
    return response.data;
  },
  getAll: async () => {
    const response = await apiClient.get('/tenants');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/tenants/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/tenants', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/tenants/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/tenants/${id}`);
    return response.data;
  },
};

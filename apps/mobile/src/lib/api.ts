import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

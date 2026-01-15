import axios from 'axios';

/**
 * API client that automatically includes tenant headers
 */
export const apiClient = axios.create({
  baseURL: '/api/backend',
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

export default apiClient;

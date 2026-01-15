import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  tenantId?: string;
  getToken?: () => string | null;
}

export class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      // Add auth token
      if (this.config.getToken) {
        const token = this.config.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Add tenant ID
      if (this.config.tenantId) {
        config.headers['x-tenant-id'] = this.config.tenantId;
      }

      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          console.error('Unauthorized - redirecting to login');
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }
}

// Export singleton instance creator
export const createApiClient = (config: ApiClientConfig) => new ApiClient(config);

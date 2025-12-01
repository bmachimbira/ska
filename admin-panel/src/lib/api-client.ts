/**
 * API client for backend communication
 */

import { ApiError } from '@/types/api';

// Use BACKEND_API_URL for server-side requests (NextAuth, API routes)
// Use NEXT_PUBLIC_API_URL for client-side requests (browser)
const API_URL = typeof window === 'undefined' 
  ? (process.env.BACKEND_API_URL || 'http://localhost:3000') + '/v1'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1');

export class ApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(token?: string) {
    this.baseUrl = API_URL;
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'UnknownError',
        message: 'An unknown error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Handle 204 No Content responses (e.g., DELETE)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload(endpoint: string, formData: FormData): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'UploadError',
        message: 'Upload failed',
      }));
      throw new Error(error.message);
    }

    return response.json();
  }
}

// Export singleton instance for client-side usage
export const apiClient = new ApiClient();

// Factory for creating authenticated clients
export function createApiClient(token?: string): ApiClient {
  return new ApiClient(token);
}

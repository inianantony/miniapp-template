import { 
  Entity, 
  FilterParams, 
  ApiResponse, 
  PaginatedResponse,
  CRUDOperations,
  BulkOperations 
} from '@miniapp-template/shared';
import { config } from '../config/app';

export class APIProvider<T extends Entity = Entity> implements CRUDOperations<T>, BulkOperations<T> {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.companyApiBaseUrl}/api/entities`;
    console.log('🌐 API Provider initialized for:', this.baseUrl);
  }

  private async makeRequest<R>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<R>> {
    try {
      const token = 'mock-bearer-token-from-auth-service';
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as ApiResponse<R>;
    } catch (error) {
      console.error('❌ API request failed:', error);
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : 'Unknown API error',
      };
    }
  }

  async list(params: FilterParams): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.set('search', params.search);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params.filters) queryParams.set('filters', JSON.stringify(params.filters));

    const endpoint = `?${queryParams.toString()}`;
    return await this.makeRequest<T[]>(endpoint) as PaginatedResponse<T>;
  }

  async get(id: string): Promise<ApiResponse<T>> {
    return await this.makeRequest<T>(`/${id}`);
  }

  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    return await this.makeRequest<T>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    return await this.makeRequest<T>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return await this.makeRequest<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return await this.makeRequest<void>('/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async bulkUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<ApiResponse<T[]>> {
    return await this.makeRequest<T[]>('/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  async export(params: FilterParams): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.set('search', params.search);
    if (params.filters) queryParams.set('filters', JSON.stringify(params.filters));

    try {
      const token = 'mock-bearer-token-from-auth-service';
      const response = await fetch(`${this.baseUrl}/export?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('❌ Export failed:', error);
      return new Blob([''], { type: 'text/plain' });
    }
  }

  async import(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = 'mock-bearer-token-from-auth-service';
      const response = await fetch(`${this.baseUrl}/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.status} ${response.statusText}`);
      }

      return await response.json() as ApiResponse<{ imported: number; errors: string[] }>;
    } catch (error) {
      console.error('❌ Import failed:', error);
      return {
        success: false,
        data: {
          imported: 0,
          errors: [error instanceof Error ? error.message : 'Unknown import error'],
        },
      };
    }
  }
}
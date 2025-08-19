export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Entity extends BaseEntity {
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  metadata?: Record<string, any>;
}

export interface EntityFormData {
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  metadata?: Record<string, any>;
}

export interface CRUDOperations<T = Entity> {
  list: (params: FilterParams) => Promise<PaginatedResponse<T>>;
  get: (id: string) => Promise<ApiResponse<T>>;
  create: (data: Partial<T>) => Promise<ApiResponse<T>>;
  update: (id: string, data: Partial<T>) => Promise<ApiResponse<T>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

export interface BulkOperations<T = Entity> {
  bulkDelete: (ids: string[]) => Promise<ApiResponse<void>>;
  bulkUpdate: (updates: Array<{ id: string; data: Partial<T> }>) => Promise<ApiResponse<T[]>>;
  export: (params: FilterParams) => Promise<Blob>;
  import: (file: File) => Promise<ApiResponse<{ imported: number; errors: string[] }>>;
}

import { ApiResponse, FilterParams, PaginatedResponse } from './api';
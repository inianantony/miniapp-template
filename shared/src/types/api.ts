export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
  message?: string;
  metadata?: ResponseMetadata;
}

export interface ResponseMetadata {
  page?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  metadata: ResponseMetadata;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  requiresAuth?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}
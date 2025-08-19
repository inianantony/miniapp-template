import { tokenManager } from './TokenManager';

export interface APIClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
}

class APIClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;

  constructor(config: APIClientConfig = {}) {
    // In development, we use the mock API
    // In production, this would be the real company API
    this.baseURL = config.baseURL || 'http://localhost:3001';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 2;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...options.headers as Record<string, string>,
        };

        // Add Bearer token if required
        if (requiresAuth) {
          const token = await tokenManager.getToken();
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}${requiresAuth ? ' (authenticated)' : ''}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Handle 401 Unauthorized - token might be expired
          if (response.status === 401 && requiresAuth && attempt === 0) {
            console.log('🔄 Received 401, clearing token and retrying...');
            tokenManager.clearToken();
            continue; // Retry with fresh token
          }

          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ API Response: ${response.status} ${response.statusText}`);
        
        return data;

      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.error(`⏰ Request timeout: ${url}`);
          } else {
            console.error(`❌ API request failed (attempt ${attempt + 1}):`, error.message);
          }
        }

        // Don't retry on the last attempt
        if (attempt === this.retries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError || new Error('API request failed after all retries');
  }

  // Dashboard API calls
  async fetchDashboardWidgets(): Promise<any> {
    return this.makeRequest('/dashboard/widgets');
  }

  async fetchSalesMetrics(): Promise<any> {
    return this.makeRequest('/metrics/sales');
  }

  async fetchInventoryReport(): Promise<any> {
    return this.makeRequest('/reports/inventory');
  }

  async fetchAnalyticsTrends(): Promise<any> {
    return this.makeRequest('/analytics/trends');
  }

  // Generic API call method
  async get<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' }, requiresAuth);
  }

  async post<T>(endpoint: string, data: any, requiresAuth: boolean = true): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      requiresAuth
    );
  }

  async put<T>(endpoint: string, data: any, requiresAuth: boolean = true): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      requiresAuth
    );
  }

  async delete<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' }, requiresAuth);
  }

  // Health check (no auth required)
  async healthCheck(): Promise<any> {
    return this.makeRequest('/health', { method: 'GET' }, false);
  }
}

// Export a singleton instance
export const apiClient = new APIClient();
import { 
  Entity, 
  FilterParams, 
  ApiResponse, 
  PaginatedResponse,
  CRUDOperations,
  BulkOperations 
} from '@miniapp-template/shared';
import { SQLiteProvider } from './SQLiteProvider';
import { APIProvider } from './APIProvider';
import { config } from '../config/app';

export class CrudService<T extends Entity = Entity> implements CRUDOperations<T>, BulkOperations<T> {
  private provider: CRUDOperations<T> & BulkOperations<T>;

  constructor() {
    // Choose provider based on configuration
    if (config.useMockCrud) {
      this.provider = new SQLiteProvider<T>();
    } else {
      this.provider = new APIProvider<T>();
    }
    
    console.log(`🔧 CRUD Service initialized with ${config.useMockCrud ? 'SQLite' : 'API'} provider`);
  }

  async list(params: FilterParams): Promise<PaginatedResponse<T>> {
    return await this.provider.list(params);
  }

  async get(id: string): Promise<ApiResponse<T>> {
    return await this.provider.get(id);
  }

  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    return await this.provider.create(data);
  }

  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    return await this.provider.update(id, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return await this.provider.delete(id);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return await this.provider.bulkDelete(ids);
  }

  async bulkUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<ApiResponse<T[]>> {
    return await this.provider.bulkUpdate(updates);
  }

  async export(params: FilterParams): Promise<Blob> {
    return await this.provider.export(params);
  }

  async import(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    return await this.provider.import(file);
  }
}
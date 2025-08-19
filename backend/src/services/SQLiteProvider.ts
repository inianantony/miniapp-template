import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { 
  Entity, 
  FilterParams, 
  ApiResponse, 
  PaginatedResponse,
  CRUDOperations,
  BulkOperations 
} from '@miniapp-template/shared';
import { config } from '../config/app';

export class SQLiteProvider<T extends Entity = Entity> implements CRUDOperations<T>, BulkOperations<T> {
  private db!: sqlite3.Database;
  private tableName = 'entities';

  constructor() {
    this.initDatabase();
  }

  private initDatabase(): void {
    // Ensure data directory exists
    const dataDir = path.dirname(config.databasePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(config.databasePath, (err) => {
      if (err) {
        console.error('❌ SQLite connection error:', err);
      } else {
        console.log('✅ Connected to SQLite database');
        this.createTables();
        this.seedData();
      }
    });
  }

  private createTables(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        metadata TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        createdBy TEXT,
        updatedBy TEXT
      )
    `;

    this.db.run(sql, (err: Error | null) => {
      if (err) {
        console.error('❌ Error creating tables:', err);
      } else {
        console.log('✅ Tables created or verified');
      }
    });
  }

  private seedData(): void {
    const checkSql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    
    this.db.get(checkSql, (err: Error | null, row: any) => {
      if (err) {
        console.error('❌ Error checking data:', err);
        return;
      }

      if (row.count === 0) {
        console.log('🌱 Seeding initial data...');
        this.insertSeedData();
      }
    });
  }

  private insertSeedData(): void {
    const seedEntities = [
      {
        id: '1',
        name: 'Sample Entity 1',
        description: 'This is a sample entity for demonstration',
        status: 'active',
        metadata: JSON.stringify({ category: 'sample', priority: 'high' }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: '2', 
        name: 'Sample Entity 2',
        description: 'Another sample entity',
        status: 'active',
        metadata: JSON.stringify({ category: 'demo', priority: 'medium' }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: '3',
        name: 'Archived Entity',
        description: 'This entity is archived',
        status: 'archived',
        metadata: JSON.stringify({ category: 'old', priority: 'low' }),
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'system',
        updatedBy: 'system',
      },
    ];

    const insertSql = `
      INSERT INTO ${this.tableName} 
      (id, name, description, status, metadata, createdAt, updatedAt, createdBy, updatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    seedEntities.forEach(entity => {
      this.db.run(insertSql, [
        entity.id, entity.name, entity.description, entity.status,
        entity.metadata, entity.createdAt, entity.updatedAt,
        entity.createdBy, entity.updatedBy
      ]);
    });

    console.log('✅ Seed data inserted');
  }

  async list(params: FilterParams): Promise<PaginatedResponse<T>> {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM ${this.tableName}`;
      let countSql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
      const sqlParams: any[] = [];
      const conditions: string[] = [];

      // Add search condition
      if (params.search) {
        conditions.push('(name LIKE ? OR description LIKE ?)');
        const searchTerm = `%${params.search}%`;
        sqlParams.push(searchTerm, searchTerm);
      }

      // Add filters
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            conditions.push(`${key} = ?`);
            sqlParams.push(value);
          }
        });
      }

      // Apply conditions
      if (conditions.length > 0) {
        const whereClause = ` WHERE ${conditions.join(' AND ')}`;
        sql += whereClause;
        countSql += whereClause;
      }

      // Add sorting
      if (params.sortBy) {
        const sortOrder = params.sortOrder || 'asc';
        sql += ` ORDER BY ${params.sortBy} ${sortOrder}`;
      } else {
        sql += ' ORDER BY updatedAt DESC';
      }

      // Add pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;
      sql += ` LIMIT ${pageSize} OFFSET ${offset}`;

      // Get total count first
      this.db.get(countSql, sqlParams, (err: Error | null, countRow: any) => {
        if (err) {
          reject(err);
          return;
        }

        const totalItems = countRow.total;
        const totalPages = Math.ceil(totalItems / pageSize);

        // Get paginated data
        this.db.all(sql, sqlParams, (err: Error | null, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }

          const data = rows.map(row => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : null,
          })) as T[];

          resolve({
            success: true,
            data,
            metadata: {
              page,
              pageSize,
              totalPages,
              totalItems,
              hasNext: page < totalPages,
              hasPrevious: page > 1,
            },
          });
        });
      });
    });
  }

  async get(id: string): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      
      this.db.get(sql, [id], (err: Error | null, row: any) => {
        if (err) {
          resolve({
            success: false,
            data: null as any,
            error: err.message,
          });
          return;
        }

        if (!row) {
          resolve({
            success: false,
            data: null as any,
            error: 'Entity not found',
          });
          return;
        }

        const entity = {
          ...row,
          metadata: row.metadata ? JSON.parse(row.metadata) : null,
        } as T;

        resolve({
          success: true,
          data: entity,
        });
      });
    });
  }

  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      const id = Date.now().toString(); // Simple ID generation
      const now = new Date().toISOString();
      
      const entity = {
        id,
        name: data.name || 'Untitled',
        description: data.description || '',
        status: data.status || 'active',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        createdAt: now,
        updatedAt: now,
        createdBy: (data as any).createdBy || 'unknown',
        updatedBy: (data as any).updatedBy || 'unknown',
      };

      const sql = `
        INSERT INTO ${this.tableName} 
        (id, name, description, status, metadata, createdAt, updatedAt, createdBy, updatedBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        entity.id, entity.name, entity.description, entity.status,
        entity.metadata, entity.createdAt, entity.updatedAt,
        entity.createdBy, entity.updatedBy
      ], (err: Error | null) => {
        if (err) {
          resolve({
            success: false,
            data: null as any,
            error: err.message,
          });
          return;
        }

        resolve({
          success: true,
          data: {
            ...entity,
            metadata: entity.metadata ? JSON.parse(entity.metadata) : null,
          } as T,
        });
      });
    });
  }

  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      const now = new Date().toISOString();
      const updates: string[] = [];
      const params: any[] = [];

      // Build dynamic update query
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'id' && value !== undefined) {
          updates.push(`${key} = ?`);
          if (key === 'metadata' && typeof value === 'object') {
            params.push(JSON.stringify(value));
          } else {
            params.push(value);
          }
        }
      });

      updates.push('updatedAt = ?');
      params.push(now);
      params.push(id); // For WHERE clause

      const sql = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`;

      this.db.run(sql, params, (err: Error | null) => {
        if (err) {
          resolve({
            success: false,
            data: null as any,
            error: err.message,
          });
          return;
        }

        // Return updated entity
        this.get(id).then(result => resolve(result));
      });
    });
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return new Promise((resolve) => {
      const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;

      this.db.run(sql, [id], (err: Error | null) => {
        if (err) {
          resolve({
            success: false,
            data: undefined,
            error: err.message,
          });
          return;
        }

        resolve({
          success: true,
          data: undefined,
        });
      });
    });
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return new Promise((resolve) => {
      const placeholders = ids.map(() => '?').join(',');
      const sql = `DELETE FROM ${this.tableName} WHERE id IN (${placeholders})`;

      this.db.run(sql, ids, (err: Error | null) => {
        if (err) {
          resolve({
            success: false,
            data: undefined,
            error: err.message,
          });
          return;
        }

        resolve({
          success: true,
          data: undefined,
          message: `Deleted entities`,
        });
      });
    });
  }

  async bulkUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<ApiResponse<T[]>> {
    // For simplicity, implement as sequential updates
    const results: T[] = [];
    
    for (const update of updates) {
      const result = await this.update(update.id, update.data);
      if (result.success && result.data) {
        results.push(result.data);
      }
    }

    return {
      success: true,
      data: results,
    };
  }

  async export(params: FilterParams): Promise<Blob> {
    // This would generate CSV/Excel data
    // For now, return a mock blob
    const csvContent = 'id,name,description,status\n1,Sample,Description,active';
    return new Blob([csvContent], { type: 'text/csv' });
  }

  async import(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    // This would parse CSV/Excel and import data
    // For now, return a mock response
    return {
      success: true,
      data: {
        imported: 0,
        errors: ['Import not implemented in SQLite provider'],
      },
    };
  }
}
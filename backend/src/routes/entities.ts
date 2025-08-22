import { Router, Request, Response } from 'express';
import { Entity, FilterParams, ApiResponse, PaginatedResponse } from '@miniapp-template/shared';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { CrudService } from '../services/CrudService';
import { config } from '../config/app';

export const entitiesRouter = Router();
const crudService = new CrudService<Entity>();

entitiesRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const filterParams: FilterParams = {
    search: req.query.search as string,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc',
    page: parseInt(req.query.page as string) || 1,
    pageSize: parseInt(req.query.pageSize as string) || 20,
    filters: req.query.filters ? JSON.parse(req.query.filters as string) : {},
  };

  const result = await crudService.list(filterParams);
  res.json(result);
}));

entitiesRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    throw createError('Entity ID is required', 400);
  }

  const result = await crudService.get(id);
  
  if (!result.success) {
    throw createError('Entity not found', 404);
  }
  
  res.json(result);
}));

entitiesRouter.post('/', asyncHandler(async (req: Request, res: Response) => {
  const entityData = req.body;
  
  if (!entityData.name) {
    throw createError('Entity name is required', 400, 'VALIDATION_ERROR', {
      field: 'name',
      message: 'Name is required',
    });
  }

  const result = await crudService.create({
    ...entityData,
    createdBy: req.user?.id,
    updatedBy: req.user?.id,
  });

  res.status(201).json(result);
}));

entitiesRouter.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  
  if (!id) {
    throw createError('Entity ID is required', 400);
  }

  const result = await crudService.update(id, {
    ...updateData,
    updatedBy: req.user?.id,
  });

  if (!result.success) {
    throw createError('Entity not found', 404);
  }

  res.json(result);
}));

entitiesRouter.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    throw createError('Entity ID is required', 400);
  }

  const result = await crudService.delete(id);
  
  if (!result.success) {
    throw createError('Entity not found', 404);
  }

  res.json(result);
}));

entitiesRouter.post('/bulk-delete', asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError('Array of IDs is required', 400);
  }

  const result = await crudService.bulkDelete(ids);
  res.json(result);
}));

entitiesRouter.get('/export', asyncHandler(async (req: Request, res: Response) => {
  const filterParams: FilterParams = {
    search: req.query.search as string,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc',
    filters: req.query.filters ? JSON.parse(req.query.filters as string) : {},
  };

  const format = req.query.format as string || 'csv';
  
  res.json({
    success: true,
    message: `Export in ${format} format initiated`,
    data: { format, filters: filterParams },
  });
}));
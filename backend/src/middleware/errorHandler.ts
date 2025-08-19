import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@miniapp-template/shared';

export interface CustomError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, any>;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  const errorResponse: ApiError = {
    status,
    message,
    code: err.code,
    details: err.details,
  };

  // Don't leak internal errors in production
  if (status === 500 && process.env.NODE_ENV === 'production') {
    errorResponse.message = 'Internal Server Error';
    delete errorResponse.details;
  }

  res.status(status).json({
    success: false,
    error: errorResponse.message,
    code: errorResponse.code,
    details: errorResponse.details,
  });
};

export const createError = (
  message: string,
  status: number = 500,
  code?: string,
  details?: Record<string, any>
): CustomError => {
  const error = new Error(message) as CustomError;
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
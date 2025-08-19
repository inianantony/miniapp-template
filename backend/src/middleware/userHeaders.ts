import { Request, Response, NextFunction } from 'express';
import { User } from '@miniapp-template/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const userHeaderMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // In development, simulate the headers that NGINX would provide
  // In production, these headers would come from the authentication service
  
  const userId = req.headers['x-user-id'] as string || 'dev-user-123';
  const userEmail = req.headers['x-user-email'] as string || 'developer@company.com';
  const userName = req.headers['x-user-name'] as string || 'Development User';
  
  // Create user object from headers
  req.user = {
    id: userId,
    email: userEmail,
    name: userName,
    roles: ['user'], // In production, this might come from additional headers or token
    permissions: ['read', 'write'], // Same here
  };

  // Add user info to response headers for frontend consumption
  res.setHeader('X-User-Id', req.user.id);
  res.setHeader('X-User-Email', req.user.email);
  res.setHeader('X-User-Name', req.user.name);

  next();
};
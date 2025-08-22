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
  
  const userId = req.headers['x-user-id'] as string || 'dev-user-123';
  const userEmail = req.headers['x-user-email'] as string || 'developer@company.com';
  const userName = req.headers['x-user-name'] as string || 'Development User';
  
  req.user = {
    id: userId,
    email: userEmail,
    name: userName,
    roles: ['user'],
    permissions: ['read', 'write'],
  };

  res.setHeader('X-User-Id', req.user.id);
  res.setHeader('X-User-Email', req.user.email);
  res.setHeader('X-User-Name', req.user.name);

  next();
};
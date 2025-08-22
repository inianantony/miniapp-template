import { Router, Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';

export const userPreferencesRouter = Router();

const mockPreferences: Record<string, any> = {};

userPreferencesRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const preferences = mockPreferences[userId] || {
    theme: 'light',
    language: 'en',
    dashboardLayout: 'default',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    gridPreferences: {
      pageSize: 20,
      defaultSort: 'updatedAt',
      defaultSortOrder: 'desc',
    },
  };

  res.json({
    success: true,
    data: preferences,
  });
}));

userPreferencesRouter.put('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const updates = req.body;
  
  const currentPreferences = mockPreferences[userId] || {};
  const updatedPreferences = {
    ...currentPreferences,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  mockPreferences[userId] = updatedPreferences;

  res.json({
    success: true,
    data: updatedPreferences,
    message: 'Preferences updated successfully',
  });
}));
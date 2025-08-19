import { Router, Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';

export const userPreferencesRouter = Router();

// Mock user preferences storage (in production, this would be in a database)
const mockPreferences: Record<string, any> = {};

// GET /api/user-preferences - Get user preferences
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

// PUT /api/user-preferences - Update user preferences
userPreferencesRouter.put('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const updates = req.body;
  
  // Merge with existing preferences
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
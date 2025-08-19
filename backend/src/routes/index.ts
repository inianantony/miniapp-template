import { Router } from 'express';
import { entitiesRouter } from './entities';
import { authRouter } from './auth';
import { userPreferencesRouter } from './userPreferences';

export const setupRoutes = (): Router => {
  const router = Router();

  // Health check
  router.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Mount route modules
  router.use('/entities', entitiesRouter);
  router.use('/auth', authRouter);
  router.use('/user-preferences', userPreferencesRouter);

  return router;
};
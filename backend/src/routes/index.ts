import { Router } from 'express';
import { entitiesRouter } from './entities';
import { authRouter } from './auth';
import { userPreferencesRouter } from './userPreferences';
import userActivityRouter from './userActivity';

export const setupRoutes = (): Router => {
  const router = Router();

  router.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  router.use('/entities', entitiesRouter);
  router.use('/auth', authRouter);
  router.use('/user-preferences', userPreferencesRouter);
  router.use('/user-activities', userActivityRouter);

  return router;
};
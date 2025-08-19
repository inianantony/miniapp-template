import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '8101', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Application configuration
  appName: process.env.APP_NAME || 'myapp',
  basePath: process.env.BASE_PATH || '/miniappsdev/myapp',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Database configuration
  useMockCrud: process.env.USE_MOCK_CRUD === 'true',
  databasePath: process.env.DATABASE_PATH || './data/mock.db',
  
  // External API configuration
  companyApiBaseUrl: process.env.COMPANY_API_BASE_URL || 'https://api.company.com',
  companyApiTimeout: parseInt(process.env.COMPANY_API_TIMEOUT || '30000', 10),
  
  // Security configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  
  // Feature flags
  enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
  enableLogging: process.env.ENABLE_LOGGING !== 'false',
} as const;

// Validation
if (config.nodeEnv === 'production' && config.jwtSecret === 'your-secret-key-change-in-production') {
  throw new Error('JWT_SECRET must be set in production');
}

console.log('📋 Configuration loaded:', {
  port: config.port,
  nodeEnv: config.nodeEnv,
  basePath: config.basePath,
  useMockCrud: config.useMockCrud,
});
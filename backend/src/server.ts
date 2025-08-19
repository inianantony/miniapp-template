import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { config } from './config/app';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { userHeaderMiddleware } from './middleware/userHeaders';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://localhost:7073", "http://localhost:3001"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// User header middleware (simulates NGINX headers)
app.use(userHeaderMiddleware);

// Serve static files from frontend build
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(config.basePath, express.static(frontendDistPath));

// API routes
app.use(`${config.basePath}/api`, setupRoutes());

// Catch-all: serve React app for client-side routes
app.get(`${config.basePath}/*`, (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// 404 handler for non-matching routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 App available at: http://localhost:${PORT}${config.basePath}/`);
  console.log(`🔧 API available at: http://localhost:${PORT}${config.basePath}/api`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`💾 Using mock CRUD: ${config.useMockCrud}`);
});

export default app;
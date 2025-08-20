import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { logger } from './config/logger';
import { seedRolesAndPrivileges } from './data/seedRoles';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import drugRoutes from './routes/drugs';
import inventoryRoutes from './routes/inventory';
import salesRoutes from './routes/sales';
// Import prescription routes
import prescriptionRoutes from './routes/prescriptions';
import reportRoutes from './routes/reports';
import storeRoutes from './routes/stores';
import tallyRoutes from './routes/tally';
import dashboardRoutes from './routes/dashboard';
import testPrivilegeRoutes from './routes/test-privileges';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env['PORT'] || 10000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production' 
    ? [
        process.env['CORS_ORIGIN'] || 'https://jelppharm-5vcm.onrender.com',
        'https://jelppharm-5vcm.onrender.com', // Your specific Render service
        /\.onrender\.com$/, // Allow all Render subdomains
        /\.vercel\.app$/,   // Allow Vercel deployments
        /\.netlify\.app$/   // Allow Netlify deployments
      ]
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/tally', tallyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/test-privileges', testPrivilegeRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../../client/build')));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Connected to MongoDB');

    // Seed roles and privileges
    await seedRolesAndPrivileges();
    logger.info('Roles and privileges seeded successfully');

    // Start server
    app.listen(PORT, () => {
      const isProduction = process.env['NODE_ENV'] === 'production';
      const serverUrl = isProduction 
        ? (process.env['RENDER_EXTERNAL_URL'] || `http://localhost:${PORT}`)
        : `http://localhost:${PORT}`;
      
      logger.info(`Server running on port ${PORT} in ${process.env['NODE_ENV'] || 'development'} mode`);
      logger.info(`Health check: ${serverUrl}/health`);
      logger.info(`API base: ${serverUrl}/api`);
      
      if (isProduction) {
        logger.info(`Production server accessible at: ${serverUrl}`);
        logger.info(`CORS configured for: ${process.env['CORS_ORIGIN'] || 'Render domains'}`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;

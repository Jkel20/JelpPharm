import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
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
import roleRoutes from './routes/roles';
import privilegeRoutes from './routes/privileges';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env['PORT'] || 5000;

// Trust proxy for rate limiting behind Render proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production' 
    ? [
        process.env['CORS_ORIGIN'] || 'https://jelppharm-server.onrender.com',
        /\.onrender\.com$/,
        /\.vercel\.app$/,
        /\.netlify\.app$/
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
app.use(morgan('combined', { stream: { write: (message) => console.log(message.trim()) } }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'],
    mode: 'real-database-mode'
  });
});

// Test endpoint for database connection
app.get('/api/test', (_req, res) => {
  res.status(200).json({ 
    message: 'Server is running with real database connection',
    timestamp: new Date().toISOString()
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
app.use('/api/roles', roleRoutes);
app.use('/api/privileges', privilegeRoutes);

// Serve static files from React build (must come before catch-all handler)
const clientBuildPath = path.join(__dirname, '../../client/build');
const staticPath = path.join(clientBuildPath, 'static');

// Check if client build exists
if (!require('fs').existsSync(clientBuildPath)) {
  console.error('❌ Client build directory not found:', clientBuildPath);
  console.error('   Please ensure the client build process completed successfully');
}

app.use('/static', express.static(staticPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Serve manifest.json with proper headers
app.get('/manifest.json', (req, res) => {
  const manifestPath = path.join(clientBuildPath, 'manifest.json');
  if (require('fs').existsSync(manifestPath)) {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.sendFile(manifestPath);
  } else {
    res.status(404).json({ error: 'Manifest file not found' });
  }
});

// Serve other static files
app.use(express.static(clientBuildPath));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Skip static file requests
  if (req.path.startsWith('/static/') || req.path === '/manifest.json') {
    return res.status(404).json({ error: 'Static file not found' });
  }
  
  // For all other routes, serve the React app
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).json({ error: 'Failed to serve application' });
      }
    });
  } else {
    console.error('❌ index.html not found:', indexPath);
    res.status(500).json({ 
      error: 'Application not built properly',
      message: 'The React application build is missing. Please check the build process.'
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Seed roles and privileges
    await seedRolesAndPrivileges();
    console.log('Roles and privileges seeded successfully');

    // Start server
    const server = app.listen(PORT, () => {
      const isProduction = process.env['NODE_ENV'] === 'production';
      const serverUrl = isProduction 
        ? `https://jelppharm-pms.onrender.com`
        : `http://localhost:${PORT}`;
        
      console.log(`🚀 Server running on port ${PORT} in ${process.env['NODE_ENV'] || 'development'} mode`);
      console.log(`🔍 Health check: ${serverUrl}/health`);
      console.log(`📡 API base: ${serverUrl}/api`);
      console.log(`🗄️ Running with REAL DATABASE connection to MongoDB Atlas`);
      
      if (isProduction) {
        console.log(`🌐 Production server accessible at: ${serverUrl}`);
        console.log(`🔒 CORS configured for: ${process.env['CORS_ORIGIN'] || 'jelppharm-pms.onrender.com'}`);
      }
    });
  } catch (error) {
    // logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  // logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  // logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;

import mongoose from 'mongoose';
import { logger } from './logger';

const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb+srv://Elorm:Kwabena_23@jelppharmarcy.cvb0ysk.mongodb.net/jelp_pharm_pms?retryWrites=true&w=majority';

// Debug logging
logger.info(`Environment MONGODB_URI: ${process.env['MONGODB_URI'] ? 'SET' : 'NOT SET'}`);
logger.info(`Using MONGODB_URI: ${MONGODB_URI}`);

// Additional debugging for Render
logger.info(`Process env keys: ${Object.keys(process.env).filter(key => key.includes('MONGODB')).join(', ')}`);
logger.info(`Full MONGODB_URI length: ${MONGODB_URI.length}`);
logger.info(`MONGODB_URI contains '/': ${MONGODB_URI.includes('/')}`);
logger.info(`MONGODB_URI contains '\\': ${MONGODB_URI.includes('\\')}`);

// Validate MongoDB URI format and extract database name
const validateMongoURI = (uri: string): { isValid: boolean; databaseName?: string; error?: string } => {
  try {
    const url = new URL(uri);
    
    if (url.protocol !== 'mongodb:' && url.protocol !== 'mongodb+srv:') {
      return { isValid: false, error: 'Invalid protocol' };
    }
    
    // Extract database name from pathname
    const databaseName = url.pathname.substring(1); // Remove leading '/'
    
    // Check if database name contains invalid characters
    if (databaseName.includes('/') || databaseName.includes('\\') || databaseName.includes(' ')) {
      return { 
        isValid: false, 
        error: `Database name contains invalid characters: ${databaseName}` 
      };
    }
    
    return { isValid: true, databaseName };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const connectDB = async (): Promise<void> => {
  try {
    // Validate MongoDB URI
    const validation = validateMongoURI(MONGODB_URI);
    if (!validation.isValid) {
      throw new Error(`Invalid MongoDB URI: ${validation.error}`);
    }
    
    logger.info(`Database name: ${validation.databaseName}`);

    // Check if MONGODB_URI is set (not using fallback)
    if (!process.env['MONGODB_URI']) {
      logger.warn('MONGODB_URI not set, using fallback localhost connection');
    } else if (MONGODB_URI.includes('mongodb+srv://')) {
      logger.info('Connecting to MongoDB Atlas...');
    } else {
      logger.info('Connecting to MongoDB...');
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000, // Increased for Atlas
      socketTimeoutMS: 45000,
      bufferCommands: false,
      // Atlas-specific options
      retryWrites: true,
      w: 'majority',
      // Connection pooling for Atlas
      maxIdleTimeMS: 30000,
      // SSL/TLS for Atlas - Atlas handles this automatically
      // ssl: true, // Remove this line - Atlas handles SSL automatically
      // tlsAllowInvalidCertificates: false, // Remove this line
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error during MongoDB connection closure:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

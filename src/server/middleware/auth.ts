import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../config/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        storeId?: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token format is invalid. Use Bearer <token>'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, (process.env['JWT_SECRET'] || 'fallback-secret') as string) as any;
      
      // Check if user still exists
      const user = await User.findById(decoded.userId).select('_id role storeId isActive');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Add user info to request
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        storeId: decoded.storeId
      };

      next();
    } catch (jwtError) {
      logger.warn(`JWT verification failed: ${jwtError}`);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Store access control middleware
export const requireStoreAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Administrators have access to all stores
  if (req.user.role === 'Administrator') {
    return next();
  }

  // Other users must have a storeId
  if (!req.user.storeId) {
    return res.status(403).json({
      success: false,
      message: 'Store access required'
    });
  }

  next();
};

// Optional authentication middleware (for routes that can work with or without auth)
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);

    try {
             const decoded = jwt.verify(token, (process.env['JWT_SECRET'] || 'fallback-secret') as string) as any;
      const user = await User.findById(decoded.userId).select('_id role storeId isActive');
      
      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
          storeId: decoded.storeId
        };
      }
    } catch (jwtError) {
      // Token is invalid, but we continue without authentication
      logger.debug(`Optional auth failed: ${jwtError}`);
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next(); // Continue without authentication
  }
};

// Admin only middleware
export const requireAdmin = requireRole(['Administrator']);

// Pharmacist or higher middleware
export const requirePharmacistOrHigher = requireRole(['Administrator', 'Pharmacist']);

// Store manager or higher middleware
export const requireStoreManagerOrHigher = requireRole(['Administrator', 'Store Manager']);

// Cashier or higher middleware
export const requireCashierOrHigher = requireRole(['Administrator', 'Pharmacist', 'Cashier', 'Store Manager']);

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

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

// Privilege-based access control middleware
export const requirePrivilege = (privilegeCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Import the userHasPrivilege function
      const { userHasPrivilege } = await import('../data/seedRoles');
      
      const hasPrivilege = await userHasPrivilege(req.user.userId, privilegeCode);
      
      if (!hasPrivilege) {
        logger.warn(`User ${req.user.userId} attempted to access resource requiring privilege: ${privilegeCode}`);
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient privileges for this action.',
          requiredPrivilege: privilegeCode
        });
      }

      next();
    } catch (error) {
      logger.error(`Error checking privilege ${privilegeCode}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error verifying user privileges'
      });
    }
  };
};

// Multiple privileges middleware (user must have ALL specified privileges)
export const requireAllPrivileges = (privilegeCodes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { userHasPrivilege } = await import('../data/seedRoles');
      
      // Check if user has ALL required privileges
      for (const privilegeCode of privilegeCodes) {
        const hasPrivilege = await userHasPrivilege(req.user.userId, privilegeCode);
        if (!hasPrivilege) {
          logger.warn(`User ${req.user.userId} missing required privilege: ${privilegeCode}`);
          return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient privileges for this action.',
            missingPrivilege: privilegeCode,
            requiredPrivileges: privilegeCodes
          });
        }
      }

      next();
    } catch (error) {
      logger.error(`Error checking multiple privileges:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error verifying user privileges'
      });
    }
  };
};

// Any privilege middleware (user must have AT LEAST ONE of the specified privileges)
export const requireAnyPrivilege = (privilegeCodes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { userHasPrivilege } = await import('../data/seedRoles');
      
      // Check if user has AT LEAST ONE of the required privileges
      for (const privilegeCode of privilegeCodes) {
        const hasPrivilege = await userHasPrivilege(req.user.userId, privilegeCode);
        if (hasPrivilege) {
          return next(); // User has at least one required privilege
        }
      }

      logger.warn(`User ${req.user.userId} missing all required privileges: ${privilegeCodes.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient privileges for this action.',
        requiredPrivileges: privilegeCodes
      });
    } catch (error) {
      logger.error(`Error checking any privilege:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error verifying user privileges'
      });
    }
  };
};

// Category-based privilege middleware (user must have ANY privilege in the specified category)
export const requireCategoryPrivilege = (category: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user's role and check if it has any privilege in the specified category
      const User = mongoose.model('User');
      const user = await User.findById(req.user.userId).populate({
        path: 'roleId',
        populate: {
          path: 'privileges'
        }
      });

      if (!user || !user.roleId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. User role not found.'
        });
      }

      const role = user.roleId as any;
      const hasCategoryPrivilege = role.privileges.some((privilege: any) => 
        privilege.category === category && privilege.isActive
      );

      if (!hasCategoryPrivilege) {
        logger.warn(`User ${req.user.userId} missing privileges in category: ${category}`);
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient privileges in this category.',
          requiredCategory: category
        });
      }

      next();
    } catch (error) {
      logger.error(`Error checking category privilege:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error verifying user privileges'
      });
    }
  };
};

// Predefined privilege combinations for common operations
export const requireUserManagement = requireCategoryPrivilege('user_management');
export const requireInventoryAccess = requireCategoryPrivilege('inventory');
export const requireSalesAccess = requireCategoryPrivilege('sales');
export const requirePrescriptionAccess = requireCategoryPrivilege('prescriptions');
export const requireReportAccess = requireCategoryPrivilege('reports');
export const requireSystemAccess = requireCategoryPrivilege('system');

// Specific privilege middleware for common operations
export const requireCreateUsers = requirePrivilege('CREATE_USERS');
export const requireEditUsers = requirePrivilege('EDIT_USERS');
export const requireDeleteUsers = requirePrivilege('DELETE_USERS');
export const requireManageInventory = requirePrivilege('MANAGE_INVENTORY');
export const requireAdjustStock = requirePrivilege('ADJUST_STOCK');
export const requireCreateSales = requirePrivilege('CREATE_SALES');
export const requireManageSales = requirePrivilege('MANAGE_SALES');
export const requireManagePrescriptions = requirePrivilege('MANAGE_PRESCRIPTIONS');
export const requireDispenseMedications = requirePrivilege('DISPENSE_MEDICATIONS');
export const requireGenerateReports = requirePrivilege('GENERATE_REPORTS');
export const requireSystemSettings = requirePrivilege('SYSTEM_SETTINGS');

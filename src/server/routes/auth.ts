import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { Store } from '../models/Store';
import { Role } from '../models/Role';
import { logger } from '../config/logger';
import { sendPasswordResetEmail } from '../utils/email';
import { auth } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateSignup = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .matches(/^(\+233|0)[0-9]{9}$/)
    .withMessage('Please provide a valid Ghana phone number'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters and contain uppercase, lowercase, digit, and special character'),
  body('role')
    .isIn(['Administrator', 'Pharmacist', 'Cashier', 'Store Manager'])
    .withMessage('Invalid role selected. Please select a valid role from the available options.'),
  body('storeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid store ID')
];

const validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const validateNewPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters and contain uppercase, lowercase, digit, and special character')
];

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public (but should be restricted in production)
router.post('/signup', authLimiter, validateSignup, async (req: express.Request, res: express.Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { fullName, username, email, phone, password, role, storeId, storeName, storeAddress } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Find the role by code
    const roleDoc = await Role.findOne({ code: role, isActive: true });
    if (!roleDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    let finalStoreId = storeId;

    // Handle store creation for non-administrators
    if (role !== 'Administrator') {
      if (storeName && storeAddress) {
        // For now, we'll create a temporary store ID to satisfy the requirement
        // In a production system, you'd want to create the store first, then the user
        // This is a simplified approach for development
        finalStoreId = new mongoose.Types.ObjectId();
        logger.info(`Using temporary store ID: ${finalStoreId} for user: ${email}`);
      } else if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store information is required for non-administrator users'
        });
      }
    }

    // Validate store assignment for non-administrators
    if (role !== 'Administrator' && finalStoreId && storeId) {
      // Only validate if a real storeId was provided (not a temporary one)
      const store = await Store.findById(finalStoreId);
      if (!store) {
        return res.status(400).json({
          success: false,
          message: 'Store not found'
        });
      }
      if (!store.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Store is not active'
        });
      }
    }

    // Create new user
    const user = new User({
      fullName,
      username,
      email,
      phone,
      password,
      roleId: roleDoc._id,
      storeId: role === 'Administrator' ? undefined : finalStoreId
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: role, storeId: finalStoreId },
      process.env['JWT_SECRET'] || 'fallback-secret',
      { expiresIn: process.env['JWT_EXPIRES_IN'] || '24h' } as jwt.SignOptions
    );

    // Log the signup
    logger.info(`New user registered: ${email} with role: ${role}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: role,
          storeId: finalStoreId
        },
        token
      }
    });

  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authLimiter, validateLogin, async (req: express.Request, res: express.Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked due to multiple failed login attempts. Please try again later or contact support.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get role information for JWT
    const role = await mongoose.model('Role').findById(user.roleId);
    const roleCode = role ? role.code : 'UNKNOWN';

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: roleCode, storeId: user.storeId },
      process.env['JWT_SECRET'] || 'fallback-secret',
      { expiresIn: process.env['JWT_EXPIRES_IN'] || '24h' } as jwt.SignOptions
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env['JWT_SECRET'] || 'fallback-secret',
      { expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d' } as jwt.SignOptions
    );

    // Log the login
    logger.info(`User logged in: ${user.email}`);

    // Determine dashboard route based on user role
    let dashboardRoute = '/dashboard';
    let dashboardType = 'general';
    let requiredPrivilege: string | null = null;
    
    switch (roleCode) {
      case 'Administrator':
        dashboardRoute = '/dashboard/admin';
        dashboardType = 'admin';
        requiredPrivilege = 'SYSTEM_SETTINGS';
        break;
      case 'Pharmacist':
        dashboardRoute = '/dashboard/pharmacist';
        dashboardType = 'pharmacist';
        requiredPrivilege = 'MANAGE_PRESCRIPTIONS';
        break;
      case 'Store Manager':
        dashboardRoute = '/dashboard/store-manager';
        dashboardType = 'store-manager';
        requiredPrivilege = 'MANAGE_INVENTORY';
        break;
      case 'Cashier':
        dashboardRoute = '/dashboard/cashier';
        dashboardType = 'cashier';
        requiredPrivilege = 'CREATE_SALES';
        break;

      default:
        dashboardRoute = '/dashboard';
        dashboardType = 'general';
        requiredPrivilege = null;
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: roleCode,
          storeId: user.storeId
        },
        token,
        refreshToken,
        dashboard: {
          route: dashboardRoute,
          type: dashboardType,
          requiredPrivilege,
          title: `${role ? role.name : roleCode} Dashboard`,
          description: `Welcome to your personalized ${dashboardType} dashboard`
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', authLimiter, validatePasswordReset, async (req: express.Request, res: express.Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      
      // Check if email is configured (works for both development and production)
      const emailUser = process.env.EMAIL_USER || '';
      const emailPass = process.env.EMAIL_PASS || '';
      const emailHost = process.env.EMAIL_HOST || '';
      
      const isEmailConfigured = emailUser && 
                               emailUser !== 'your-email@gmail.com' && 
                               emailPass && 
                               emailPass !== 'your-app-password' &&
                               emailHost;
      
      if (!isEmailConfigured) {
        // Email not configured, return the reset token for testing
        logger.info('Email not configured, returning reset token for testing');
        return res.json({
          success: true,
          message: 'Password reset token generated successfully (email not configured)',
          development: {
            resetToken: resetToken,
            resetUrl: `${process.env.CLIENT_URL || 'https://jelppharm-pms.onrender.com'}/reset-password?token=${resetToken}`,
            note: 'Email not configured. Use the reset URL above to test password reset.'
          }
        });
      } else {
        // Reset the token if email fails with configured email
        user.passwordResetToken = '';
        user.passwordResetExpires = new Date(0);
        await user.save();
        
        return res.status(500).json({
          success: false,
          message: 'Failed to send password reset email. Please try again later.'
        });
      }
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', authLimiter, validateNewPassword, async (req: express.Request, res: express.Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = '';
    user.passwordResetExpires = new Date(0);
    await user.save();

    // Log the password reset
    logger.info(`Password reset successful for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Public
router.post('/refresh-token', async (req: express.Request, res: express.Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, (process.env['JWT_SECRET'] || 'fallback-secret') as string) as any;
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Get role information for JWT
    const role = await mongoose.model('Role').findById(user.roleId);
    const roleCode = role ? role.code : 'UNKNOWN';

    // Generate new access token
    const newToken = jwt.sign(
      { userId: user._id, role: roleCode, storeId: user.storeId },
      process.env['JWT_SECRET'] || 'fallback-secret',
      { expiresIn: process.env['JWT_EXPIRES_IN'] || '24h' } as jwt.SignOptions
    );

    res.json({
      success: true,
      data: { token: newToken }
    });

  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req: express.Request, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('storeId', 'name address.city address.region')
      .populate({
        path: 'roleId',
        select: 'name code description privileges',
        populate: {
          path: 'privileges',
          select: 'name code category description'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   GET /api/auth/my-dashboard
// @desc    Get current user's role-based dashboard info
// @access  Private
router.get('/my-dashboard', auth, async (req: express.Request, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate({
        path: 'roleId',
        select: 'name code description privileges',
        populate: {
          path: 'privileges',
          select: 'name code category description'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Determine which dashboard the user should see based on their role
    let dashboardType = 'general';
    let dashboardEndpoint = '/api/dashboard';
    let requiredPrivilege: string | null = null;

    if (user.roleId) {
      const role = user.roleId as any;
      
      if (role.code === 'ADMINISTRATOR') {
        dashboardType = 'admin';
        dashboardEndpoint = '/api/dashboard/admin';
        requiredPrivilege = 'SYSTEM_SETTINGS';
      } else if (role.code === 'PHARMACIST') {
        dashboardType = 'pharmacist';
        dashboardEndpoint = '/api/dashboard/pharmacist';
        requiredPrivilege = 'MANAGE_PRESCRIPTIONS';
      } else if (role.code === 'STORE_MANAGER') {
        dashboardType = 'store-manager';
        dashboardEndpoint = '/api/dashboard/store-manager';
        requiredPrivilege = 'MANAGE_INVENTORY';
      } else if (role.code === 'CASHIER') {
        dashboardType = 'cashier';
        dashboardEndpoint = '/api/dashboard/cashier';
        requiredPrivilege = 'CREATE_SALES';
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.roleId ? (user.roleId as any).code : 'UNKNOWN',
          roleDetails: user.roleId ? {
            name: (user.roleId as any).name,
            code: (user.roleId as any).code,
            description: (user.roleId as any).description,
            privileges: (user.roleId as any).privileges
          } : null
        },
        dashboard: {
          type: dashboardType,
          endpoint: dashboardEndpoint,
          requiredPrivilege,
          title: `${(user.roleId as any)?.name || 'User'} Dashboard`,
          description: `Welcome to your personalized ${dashboardType} dashboard`
        }
      }
    });

  } catch (error) {
    logger.error('Get dashboard info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard info'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client should discard token)
// @access  Private
router.post('/logout', auth, async (req: express.Request, res: express.Response) => {
  try {
    // In a more sophisticated system, you might want to blacklist the token
    // For now, we'll just return success and let the client handle token removal
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    logger.info(`User logged out: ${req.user.userId}`);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

export default router;

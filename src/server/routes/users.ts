import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { logger } from '../config/logger';
import { 
  auth, 
  requireAdmin, 
  requirePrivilege, 
  requireAllPrivileges,
  requireUserManagement,
  requireCreateUsers,
  requireEditUsers,
  requireDeleteUsers
} from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Validation middleware
const validateUser = [
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
  body('role')
    .isIn(['Administrator', 'Pharmacist', 'Cashier', 'Store Manager'])
    .withMessage('Invalid role selected'),
  body('storeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid store ID')
];

const validateUserUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^(\+233|0)[0-9]{9}$/)
    .withMessage('Please provide a valid Ghana phone number'),
  body('role')
    .optional()
    .isIn(['Administrator', 'Pharmacist', 'Cashier', 'Store Manager'])
    .withMessage('Invalid role selected'),
  body('storeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid store ID')
];

// @route   GET /api/users
// @desc    Get all users (requires VIEW_USERS privilege)
// @access  Private/Privilege-based
router.get('/', auth, requirePrivilege('VIEW_USERS'), asyncHandler(async (_req: express.Request, res: express.Response) => {
  const users = await User.find()
    .select('-password')
    .populate('storeId', 'name address.city address.region')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { users }
  });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('storeId', 'name address.city address.region');

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
}));

// @route   POST /api/users
// @desc    Create new user (requires CREATE_USERS privilege)
// @access  Private/Privilege-based
router.post('/', auth, requireCreateUsers, validateUser, asyncHandler(async (req: express.Request, res: express.Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { fullName, username, email, phone, password, role, storeId } = req.body;

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

  // Create new user
  const user = new User({
    fullName,
    username,
    email,
    phone,
    password,
    role,
    storeId
  });

  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  const { password: _, ...userWithoutPassword } = userResponse;

  logger.info(`New user created by admin: ${email} with role: ${role}`);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user: userWithoutPassword }
  });
}));

// @route   PUT /api/users/:id
// @desc    Update user (requires EDIT_USERS privilege)
// @access  Private/Privilege-based
router.put('/:id', auth, requireEditUsers, validateUserUpdate, asyncHandler(async (req: express.Request, res: express.Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { fullName, phone, role, storeId } = req.body;
  const userId = req.params.id;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Only admins can change roles
  if (role && req.user?.role !== 'Administrator') {
    return res.status(403).json({
      success: false,
      message: 'Only administrators can change user roles'
    });
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { fullName, phone, role, storeId },
    { new: true, runValidators: true }
  ).select('-password');

  logger.info(`User updated: ${updatedUser?.email}`);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user: updatedUser }
  });
}));

// @route   DELETE /api/users/:id
// @desc    Delete user (requires DELETE_USERS privilege)
// @access  Private/Privilege-based
router.delete('/:id', auth, requireDeleteUsers, asyncHandler(async (req: express.Request, res: express.Response) => {
  const userId = req.params.id;

  // Prevent admin from deleting themselves
  if (userId === req.user?.userId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Soft delete - set isActive to false
  user.isActive = false;
  await user.save();

  logger.info(`User deactivated: ${user.email}`);

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
}));

// @route   POST /api/users/:id/activate
// @desc    Activate user account (requires EDIT_USERS privilege)
// @access  Private/Privilege-based
router.post('/:id/activate', auth, requireEditUsers, asyncHandler(async (req: express.Request, res: express.Response) => {
  const userId = req.params.id;
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isActive = true;
  await user.save();

  logger.info(`User activated: ${user.email}`);

  res.json({
    success: true,
    message: 'User activated successfully',
    data: { user: { id: user._id, email: user.email, isActive: user.isActive } }
  });
}));

// @route   POST /api/users/:id/deactivate
// @desc    Deactivate user account (requires EDIT_USERS privilege)
// @access  Private/Privilege-based
router.post('/:id/deactivate', auth, requireEditUsers, asyncHandler(async (req: express.Request, res: express.Response) => {
  const userId = req.params.id;
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isActive = false;
  await user.save();

  logger.info(`User deactivated: ${user.email}`);

  res.json({
    success: true,
    message: 'User deactivated successfully',
    data: { user: { id: user._id, email: user.email, isActive: user.isActive } }
  });
}));

// @route   POST /api/users/:id/change-role
// @desc    Change user role (requires both EDIT_USERS and specific role management privileges)
// @access  Private/Privilege-based
router.post('/:id/change-role', auth, requireAllPrivileges(['EDIT_USERS', 'MANAGE_INVENTORY']), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { roleId } = req.body;
  const userId = req.params.id;

  if (!roleId) {
    return res.status(400).json({
      success: false,
      message: 'Role ID is required'
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.roleId = roleId;
  await user.save();

  logger.info(`User role changed: ${user.email} to role: ${roleId}`);

  res.json({
    success: true,
    message: 'User role changed successfully',
    data: { user: { id: user._id, email: user.email, roleId: user.roleId } }
  });
}));

export default router;

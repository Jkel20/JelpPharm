import express from 'express';
import { 
  auth, 
  requirePrivilege, 
  requireAllPrivileges,
  requireAnyPrivilege,
  requireCategoryPrivilege,
  requireUserManagement,
  requireInventoryAccess
} from '../middleware/auth';

const router = express.Router();

// Test route for single privilege check
router.get('/test-single-privilege', 
  auth, 
  requirePrivilege('VIEW_USERS'), 
  (req, res) => {
    res.json({
      success: true,
      message: 'Single privilege check passed - VIEW_USERS required',
      user: req.user
    });
  }
);

// Test route for multiple privileges (ALL required)
router.get('/test-all-privileges', 
  auth, 
  requireAllPrivileges(['VIEW_USERS', 'VIEW_INVENTORY']), 
  (req, res) => {
    res.json({
      success: true,
      message: 'All privileges check passed - VIEW_USERS AND VIEW_INVENTORY required',
      user: req.user
    });
  }
);

// Test route for multiple privileges (ANY required)
router.get('/test-any-privilege', 
  auth, 
  requireAnyPrivilege(['VIEW_USERS', 'VIEW_INVENTORY']), 
  (req, res) => {
    res.json({
      success: true,
      message: 'Any privilege check passed - VIEW_USERS OR VIEW_INVENTORY required',
      user: req.user
    });
  }
);

// Test route for category privilege
router.get('/test-category-privilege', 
  auth, 
  requireCategoryPrivilege('user_management'), 
  (req, res) => {
    res.json({
      success: true,
      message: 'Category privilege check passed - any user_management privilege required',
      user: req.user
    });
  }
);

// Test route for predefined category middleware
router.get('/test-user-management', 
  auth, 
  requireUserManagement, 
  (req, res) => {
    res.json({
      success: true,
      message: 'User management category check passed',
      user: req.user
    });
  }
);

// Test route for inventory access
router.get('/test-inventory-access', 
  auth, 
  requireInventoryAccess, 
  (req, res) => {
    res.json({
      success: true,
      message: 'Inventory access category check passed',
      user: req.user
    });
  }
);

// Test route that should fail for most users
router.get('/test-admin-only', 
  auth, 
  requirePrivilege('SYSTEM_SETTINGS'), 
  (req, res) => {
    res.json({
      success: true,
      message: 'Admin privilege check passed - SYSTEM_SETTINGS required',
      user: req.user
    });
  }
);

// Test route for combined middleware
router.get('/test-combined', 
  auth, 
  requireUserManagement,
  requireInventoryAccess,
  (req, res) => {
    res.json({
      success: true,
      message: 'Combined middleware check passed - both user management and inventory access required',
      user: req.user
    });
  }
);

export default router;

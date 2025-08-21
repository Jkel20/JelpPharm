import express from 'express';
import { auth, requirePrivilege, requireAllPrivileges, requireAnyPrivilege, requireCategoryPrivilege } from '../middleware/auth';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Privilege } from '../models/Privilege';
import { logger } from '../config/logger';

const router = express.Router();

// Test single privilege requirement
router.get('/test-single-privilege', auth, requirePrivilege('VIEW_USERS'), (req, res) => {
  res.json({
    success: true,
    message: 'Access granted! You have VIEW_USERS privilege.',
    user: req.user,
    requiredPrivilege: 'VIEW_USERS'
  });
});

// Test multiple privileges (ALL required)
router.get('/test-all-privileges', auth, requireAllPrivileges(['VIEW_USERS', 'VIEW_INVENTORY']), (req, res) => {
  res.json({
    success: true,
    message: 'Access granted! You have ALL required privileges: VIEW_USERS AND VIEW_INVENTORY',
    user: req.user,
    requiredPrivileges: ['VIEW_USERS', 'VIEW_INVENTORY']
  });
});

// Test multiple privileges (ANY required)
router.get('/test-any-privilege', auth, requireAnyPrivilege(['VIEW_USERS', 'VIEW_INVENTORY', 'VIEW_SALES']), (req, res) => {
    res.json({
      success: true,
    message: 'Access granted! You have at least ONE of the required privileges: VIEW_USERS OR VIEW_INVENTORY OR VIEW_SALES',
    user: req.user,
    requiredPrivileges: ['VIEW_USERS', 'VIEW_INVENTORY', 'VIEW_SALES']
  });
});

// Test category-based access
router.get('/test-category-privilege', auth, requireCategoryPrivilege('user_management'), (req, res) => {
    res.json({
      success: true,
    message: 'Access granted! You have at least ONE user_management privilege.',
    user: req.user,
    requiredCategory: 'user_management'
  });
});

// ========================================
// ROLE-BASED DASHBOARD TEST ENDPOINTS
// ========================================

// Test Administrator Dashboard Access
router.get('/test-admin-dashboard', auth, requirePrivilege('SYSTEM_SETTINGS'), async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId).populate('roleId');
    const role = user?.roleId as any;
    
    res.json({
      success: true,
      message: '🎯 ADMINISTRATOR DASHBOARD ACCESS GRANTED!',
      user: {
        id: user?._id,
        name: user?.fullName,
        role: role?.name || 'Unknown',
        roleCode: role?.code || 'Unknown'
      },
      requiredPrivilege: 'SYSTEM_SETTINGS',
      dashboardFeatures: [
        'Full system overview',
        'User management',
        'Role and privilege management',
        'System settings',
        'Database management',
        'All reports access'
      ],
      quickActions: [
        { name: 'Manage Users', endpoint: '/api/users', method: 'GET' },
        { name: 'Manage Roles', endpoint: '/api/roles', method: 'GET' },
        { name: 'Manage Privileges', endpoint: '/api/privileges', method: 'GET' },
        { name: 'System Reports', endpoint: '/api/reports', method: 'GET' }
      ],
      systemStats: {
        totalUsers: await User.countDocuments(),
        totalRoles: await Role.countDocuments(),
        totalPrivileges: await Privilege.countDocuments()
      }
    });
  } catch (error) {
    logger.error('Error testing admin dashboard access:', error);
    res.status(500).json({ message: 'Error testing admin dashboard access' });
  }
});

// Test Pharmacist Dashboard Access
router.get('/test-pharmacist-dashboard', auth, requirePrivilege('MANAGE_PRESCRIPTIONS'), async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId).populate('roleId');
    const role = user?.roleId as any;
    
    res.json({
      success: true,
      message: '💊 PHARMACIST DASHBOARD ACCESS GRANTED!',
      user: {
        id: user?._id,
        name: user?.fullName,
        role: role?.name || 'Unknown',
        roleCode: role?.code || 'Unknown'
      },
      requiredPrivilege: 'MANAGE_PRESCRIPTIONS',
      dashboardFeatures: [
        'Prescription management',
        'Inventory access for medications',
        'Sales operations',
        'Patient safety monitoring',
        'Drug interaction checks',
        'Critical stock alerts'
      ],
      quickActions: [
        { name: 'Manage Prescriptions', endpoint: '/api/prescriptions', method: 'GET' },
        { name: 'Check Inventory', endpoint: '/api/inventory', method: 'GET' },
        { name: 'Process Sales', endpoint: '/api/sales', method: 'POST' },
        { name: 'Patient Safety Check', endpoint: '/api/drugs/interactions', method: 'GET' }
      ],
      rolePrivileges: [
        'VIEW_USERS',
        'VIEW_INVENTORY',
        'MANAGE_INVENTORY',
        'ADJUST_STOCK',
        'VIEW_SALES',
        'CREATE_SALES',
        'MANAGE_SALES',
        'VIEW_PRESCRIPTIONS',
        'MANAGE_PRESCRIPTIONS',
        'DISPENSE_MEDICATIONS',
        'VIEW_REPORTS',
        'GENERATE_REPORTS'
      ]
    });
  } catch (error) {
    logger.error('Error testing pharmacist dashboard access:', error);
    res.status(500).json({ message: 'Error testing pharmacist dashboard access' });
  }
});

// Test Store Manager Dashboard Access
router.get('/test-store-manager-dashboard', auth, requirePrivilege('MANAGE_INVENTORY'), async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId).populate('roleId');
    const role = user?.roleId as any;
    
    res.json({
      success: true,
      message: '🏪 STORE MANAGER DASHBOARD ACCESS GRANTED!',
      user: {
        id: user?._id,
        name: user?.fullName,
        role: role?.name || 'Unknown',
        roleCode: role?.code || 'Unknown'
      },
      requiredPrivilege: 'MANAGE_INVENTORY',
      dashboardFeatures: [
        'Business operations overview',
        'Staff management',
        'Inventory control',
        'Performance monitoring',
        'Sales analytics',
        'Staff performance tracking'
      ],
      quickActions: [
        { name: 'View Sales Reports', endpoint: '/api/reports/sales', method: 'GET' },
        { name: 'Manage Staff', endpoint: '/api/users', method: 'GET' },
        { name: 'Inventory Overview', endpoint: '/api/inventory', method: 'GET' },
        { name: 'Performance Analytics', endpoint: '/api/reports/performance', method: 'GET' }
      ],
      rolePrivileges: [
        'VIEW_USERS',
        'CREATE_USERS',
        'EDIT_USERS',
        'VIEW_INVENTORY',
        'MANAGE_INVENTORY',
        'ADJUST_STOCK',
        'VIEW_SALES',
        'CREATE_SALES',
        'MANAGE_SALES',
        'VIEW_PRESCRIPTIONS',
        'MANAGE_PRESCRIPTIONS',
        'DISPENSE_MEDICATIONS',
        'VIEW_REPORTS',
        'GENERATE_REPORTS'
      ]
    });
  } catch (error) {
    logger.error('Error testing store manager dashboard access:', error);
    res.status(500).json({ message: 'Error testing store manager dashboard access' });
  }
});

// Test Cashier Dashboard Access
router.get('/test-cashier-dashboard', auth, requirePrivilege('CREATE_SALES'), async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId).populate('roleId');
    const role = user?.roleId as any;
    
    res.json({
      success: true,
      message: '💳 CASHIER DASHBOARD ACCESS GRANTED!',
      user: {
        id: user?._id,
        name: user?.fullName,
        role: role?.name || 'Unknown',
        roleCode: role?.code || 'Unknown'
      },
      requiredPrivilege: 'CREATE_SALES',
      dashboardFeatures: [
        'Process sales transactions',
        'View inventory for sales',
        'Customer service tools',
        'Basic reporting access',
        'Daily transaction summary',
        'Popular items tracking'
      ],
      quickActions: [
        { name: 'New Sale', endpoint: '/api/sales', method: 'POST' },
        { name: 'Check Inventory', endpoint: '/api/inventory', method: 'GET' },
        { name: 'View Prescriptions', endpoint: '/api/prescriptions', method: 'GET' },
        { name: 'Daily Summary', endpoint: '/api/sales/daily-summary', method: 'GET' }
      ],
      rolePrivileges: [
        'VIEW_INVENTORY',
        'VIEW_SALES',
        'CREATE_SALES',
        'VIEW_PRESCRIPTIONS',
        'VIEW_REPORTS'
      ]
    });
  } catch (error) {
    logger.error('Error testing cashier dashboard access:', error);
    res.status(500).json({ message: 'Error testing cashier dashboard access' });
  }
});

// Test Access Denied (for demonstration)
router.get('/test-access-denied', auth, requirePrivilege('SYSTEM_SETTINGS'), (req, res) => {
  // This will only work for users with SYSTEM_SETTINGS privilege
    res.json({
      success: true,
    message: 'Access granted! You have SYSTEM_SETTINGS privilege.',
    note: 'If you see this, you have admin-level access. Try accessing this endpoint with a user who lacks SYSTEM_SETTINGS privilege to see access denied.'
  });
});

// Get current user's role and privileges
router.get('/my-role-info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId)
      .populate({
        path: 'roleId',
        populate: {
          path: 'privileges',
          select: 'name code category description'
        }
      });

    if (!user || !user.roleId) {
      return res.status(404).json({
        success: false,
        message: 'User or role not found'
      });
    }

    const role = user.roleId as any;
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email
      },
      role: {
        id: role._id,
        name: role.name,
        code: role.code,
        description: role.description,
        isSystem: role.isSystem,
        isActive: role.isActive
      },
      privileges: role.privileges.map((p: any) => ({
        id: p._id,
        name: p.name,
        code: p.code,
        category: p.category,
        description: p.description
      })),
      privilegeCount: role.privileges.length,
      categories: [...new Set(role.privileges.map((p: any) => p.category))],
      dashboardAccess: {
        admin: role.privileges.some((p: any) => p.code === 'SYSTEM_SETTINGS'),
        pharmacist: role.privileges.some((p: any) => p.code === 'MANAGE_PRESCRIPTIONS'),
        storeManager: role.privileges.some((p: any) => p.code === 'MANAGE_INVENTORY'),
        cashier: role.privileges.some((p: any) => p.code === 'CREATE_SALES')
      }
    });
  } catch (error) {
    logger.error('Error fetching user role info:', error);
    res.status(500).json({ message: 'Error fetching user role info' });
  }
});

export default router;

import express from 'express';
import { auth, requirePrivilege } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { userHasPrivilege, getRoleByCode } from '../data/seedRoles';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Privilege } from '../models/Privilege';
import { logger } from '../config/logger';

const router = express.Router();

// Test route to check privilege system
router.get('/test', auth, asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    logger.info(`Testing privilege system for user: ${req.user?.userId}`);
    
    // Test 1: Check if roles exist
    const roles = await Role.find().populate('privileges');
    logger.info(`Found ${roles.length} roles`);
    
    // Test 2: Check if privileges exist
    const privileges = await Privilege.find();
    logger.info(`Found ${privileges.length} privileges`);
    
    // Test 3: Check current user's role and privileges
    const user = await User.findById(req.user?.userId).populate({
      path: 'roleId',
      populate: {
        path: 'privileges'
      }
    });
    
    if (!user || !user.roleId) {
      return res.status(400).json({
        success: false,
        message: 'User not found or has no role'
      });
    }
    
    const role = user.roleId as any;
    logger.info(`User ${user.email} has role: ${role.code} with ${role.privileges.length} privileges`);
    
    // Test 4: Test privilege checking
    const hasViewInventory = await userHasPrivilege(req.user!.userId, 'VIEW_INVENTORY');
    const hasManageInventory = await userHasPrivilege(req.user!.userId, 'MANAGE_INVENTORY');
    const hasCreateUsers = await userHasPrivilege(req.user!.userId, 'CREATE_USERS');
    
    res.json({
      success: true,
      message: 'Privilege system test completed',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: role.code,
          roleName: role.name
        },
        rolePrivileges: role.privileges.map((p: any) => ({
          code: p.code,
          name: p.name,
          category: p.category
        })),
        privilegeTests: {
          VIEW_INVENTORY: hasViewInventory,
          MANAGE_INVENTORY: hasManageInventory,
          CREATE_USERS: hasCreateUsers
        },
        systemInfo: {
          totalRoles: roles.length,
          totalPrivileges: privileges.length
        }
      }
    });
    
  } catch (error) {
    logger.error('Error testing privilege system:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing privilege system',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Test route that requires specific privileges
router.get('/test-view-inventory', auth, requirePrivilege('VIEW_INVENTORY'), asyncHandler(async (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'Access granted to VIEW_INVENTORY privilege',
    user: req.user
  });
}));

router.get('/test-manage-inventory', auth, requirePrivilege('MANAGE_INVENTORY'), asyncHandler(async (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'Access granted to MANAGE_INVENTORY privilege',
    user: req.user
  });
}));

router.get('/test-create-users', auth, requirePrivilege('CREATE_USERS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'Access granted to CREATE_USERS privilege',
    user: req.user
  });
}));

export default router;

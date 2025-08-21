import express from 'express';
import { auth, requirePrivilege, requireAllPrivileges } from '../middleware/auth';
import { Role } from '../models/Role';
import { Privilege } from '../models/Privilege';
import { User } from '../models/User';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Privilege-based
router.get('/', auth, requirePrivilege('VIEW_USERS'), asyncHandler(async (_req: express.Request, res: express.Response) => {
  try {
    const roles = await Role.find({ isActive: true })
      .populate('privileges', 'name code category description')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    logger.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching roles'
    });
  }
}));

// @desc    Get role by ID
// @route   GET /api/roles/:id
// @access  Private/Privilege-based
router.get('/:id', auth, requirePrivilege('VIEW_USERS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('privileges', 'name code category description');

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    logger.error('Error fetching role:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role'
    });
  }
}));

// @desc    Create new role
// @route   POST /api/roles
// @access  Private/Privilege-based
router.post('/', auth, requireAllPrivileges(['CREATE_USERS', 'SYSTEM_SETTINGS']), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, code, privileges } = req.body;

    // Validate required fields
    if (!name || !description || !code || !privileges || !Array.isArray(privileges)) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, code, and privileges array are required'
      });
    }

    // Check if role code already exists
    const existingRole = await Role.findOne({ code });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role code already exists'
      });
    }

    // Validate privileges exist
    const validPrivileges = await Privilege.find({ _id: { $in: privileges } });
    if (validPrivileges.length !== privileges.length) {
      return res.status(400).json({
        success: false,
        message: 'Some privileges are invalid'
      });
    }

    const role = new Role({
      name,
      description,
      code,
      privileges,
      isActive: true,
      isSystem: false
    });

    await role.save();
    await role.populate('privileges', 'name code category description');

    logger.info(`New role created: ${role.name} (${role.code})`);

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    logger.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating role'
    });
  }
}));

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private/Privilege-based
router.put('/:id', auth, requireAllPrivileges(['EDIT_USERS', 'SYSTEM_SETTINGS']), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, privileges } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent modification of system roles
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'System roles cannot be modified'
      });
    }

    // Validate privileges if provided
    if (privileges && Array.isArray(privileges)) {
      const validPrivileges = await Privilege.find({ _id: { $in: privileges } });
      if (validPrivileges.length !== privileges.length) {
        return res.status(400).json({
          success: false,
          message: 'Some privileges are invalid'
        });
      }
      role.privileges = privileges;
    }

    if (name) role.name = name;
    if (description) role.description = description;

    await role.save();
    await role.populate('privileges', 'name code category description');

    logger.info(`Role updated: ${role.name} (${role.code})`);

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    logger.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role'
    });
  }
}));

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private/Privilege-based
router.delete('/:id', auth, requireAllPrivileges(['DELETE_USERS', 'SYSTEM_SETTINGS']), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'System roles cannot be deleted'
      });
    }

    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({ roleId: role._id });
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. It is assigned to ${usersWithRole} user(s)`
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    logger.info(`Role deleted: ${role.name} (${role.code})`);

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting role'
    });
  }
}));

// @desc    Activate/Deactivate role
// @route   PATCH /api/roles/:id/toggle-status
// @access  Private/Privilege-based
router.patch('/:id/toggle-status', auth, requireAllPrivileges(['EDIT_USERS', 'SYSTEM_SETTINGS']), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent deactivation of system roles
    if (role.isSystem && !role.isActive) {
      return res.status(400).json({
        success: false,
        message: 'System roles cannot be deactivated'
      });
    }

    role.isActive = !role.isActive;
    await role.save();

    const action = role.isActive ? 'activated' : 'deactivated';
    logger.info(`Role ${action}: ${role.name} (${role.code})`);

    res.json({
      success: true,
      message: `Role ${action} successfully`,
      data: { isActive: role.isActive }
    });
  } catch (error) {
    logger.error('Error toggling role status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling role status'
    });
  }
}));

// @desc    Get role statistics
// @route   GET /api/roles/:id/stats
// @access  Private/Privilege-based
router.get('/:id/stats', auth, requirePrivilege('VIEW_USERS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Count users with this role
    const userCount = await User.countDocuments({ roleId: role._id, isActive: true });

    // Get privilege count
    const privilegeCount = role.privileges.length;

    res.json({
      success: true,
      data: {
        roleId: role._id,
        roleName: role.name,
        roleCode: role.code,
        userCount,
        privilegeCount,
        isActive: role.isActive,
        isSystem: role.isSystem
      }
    });
  } catch (error) {
    logger.error('Error fetching role stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role statistics'
    });
  }
}));

export default router;

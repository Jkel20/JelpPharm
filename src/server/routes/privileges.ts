import express from 'express';
import { auth, requirePrivilege, requireAllPrivileges } from '../middleware/auth';
import { Privilege } from '../models/Privilege';
import { Role } from '../models/Role';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// @desc    Get all privileges
// @route   GET /api/privileges
// @access  Private/Privilege-based
router.get('/', auth, requirePrivilege('SYSTEM_SETTINGS'), asyncHandler(async (_req: express.Request, res: express.Response) => {
  try {
    const privileges = await Privilege.find({ isActive: true })
      .sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: privileges.length,
      data: privileges
    });
  } catch (error) {
    logger.error('Error fetching privileges:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching privileges'
    });
  }
}));

// @desc    Get privileges by category
// @route   GET /api/privileges/category/:category
// @access  Private/Privilege-based
router.get('/category/:category', auth, requirePrivilege('SYSTEM_SETTINGS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const { category } = req.params;
    
    const privileges = await Privilege.find({ 
      category, 
      isActive: true 
    }).sort({ name: 1 });

    res.json({
      success: true,
      count: privileges.length,
      category,
      data: privileges
    });
  } catch (error) {
    logger.error('Error fetching privileges by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching privileges by category'
    });
  }
}));

// @desc    Get privilege by ID
// @route   GET /api/privileges/:id
// @access  Private/Privilege-based
router.get('/:id', auth, requirePrivilege('SYSTEM_SETTINGS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const privilege = await Privilege.findById(req.params.id);

    if (!privilege) {
      return res.status(404).json({
        success: false,
        message: 'Privilege not found'
      });
    }

    res.json({
      success: true,
      data: privilege
    });
  } catch (error) {
    logger.error('Error fetching privilege:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching privilege'
    });
  }
}));

// @desc    Create new privilege
// @route   POST /api/privileges
// @access  Private/Privilege-based
router.post('/', auth, requirePrivilege('SYSTEM_SETTINGS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, code, category } = req.body;

    // Validate required fields
    if (!name || !description || !code || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, code, and category are required'
      });
    }

    // Check if privilege code already exists
    const existingPrivilege = await Privilege.findOne({ code });
    if (existingPrivilege) {
      return res.status(400).json({
        success: false,
        message: 'Privilege code already exists'
      });
    }

    // Validate category
    const validCategories = ['user_management', 'inventory', 'sales', 'prescriptions', 'reports', 'system'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
      });
    }

    const privilege = new Privilege({
      name,
      description,
      code,
      category,
      isActive: true
    });

    await privilege.save();

    logger.info(`New privilege created: ${privilege.name} (${privilege.code})`);

    res.status(201).json({
      success: true,
      message: 'Privilege created successfully',
      data: privilege
    });
  } catch (error) {
    logger.error('Error creating privilege:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating privilege'
    });
  }
}));

// @desc    Update privilege
// @route   PUT /api/privileges/:id
// @access  Private/Privilege-based
router.put('/:id', auth, requirePrivilege('SYSTEM_SETTINGS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, category } = req.body;

    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) {
      return res.status(404).json({
        success: false,
        message: 'Privilege not found'
      });
    }

    // Validate category if provided
    if (category) {
      const validCategories = ['user_management', 'inventory', 'sales', 'prescriptions', 'reports', 'system'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
        });
      }
      privilege.category = category;
    }

    if (name) privilege.name = name;
    if (description) privilege.description = description;

    await privilege.save();

    logger.info(`Privilege updated: ${privilege.name} (${privilege.code})`);

    res.json({
      success: true,
      message: 'Privilege updated successfully',
      data: privilege
    });
  } catch (error) {
    logger.error('Error updating privilege:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating privilege'
    });
  }
}));

// @desc    Delete privilege
// @route   DELETE /api/privileges/:id
// @access  Private/Privilege-based
router.delete('/:id', auth, requirePrivilege('SYSTEM_SETTINGS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) {
      return res.status(404).json({
        success: false,
        message: 'Privilege not found'
      });
    }

    // Check if privilege is assigned to any roles
    const rolesWithPrivilege = await Role.countDocuments({ 
      privileges: privilege._id,
      isActive: true 
    });

    if (rolesWithPrivilege > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete privilege. It is assigned to ${rolesWithPrivilege} active role(s)`
      });
    }

    await Privilege.findByIdAndDelete(req.params.id);

    logger.info(`Privilege deleted: ${privilege.name} (${privilege.code})`);

    res.json({
      success: true,
      message: 'Privilege deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting privilege:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting privilege'
    });
  }
}));

// @desc    Activate/Deactivate privilege
// @route   PATCH /api/privileges/:id/toggle-status
// @access  Private/Privilege-based
router.patch('/:id/toggle-status', auth, requirePrivilege('SYSTEM_SETTINGS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) {
      return res.status(404).json({
        success: false,
        message: 'Privilege not found'
      });
    }

    privilege.isActive = !privilege.isActive;
    await privilege.save();

    const action = privilege.isActive ? 'activated' : 'deactivated';
    logger.info(`Privilege ${action}: ${privilege.name} (${privilege.code})`);

    res.json({
      success: true,
      message: `Privilege ${action} successfully`,
      data: { isActive: privilege.isActive }
    });
  } catch (error) {
    logger.error('Error toggling privilege status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling privilege status'
    });
  }
}));

// @desc    Get privilege statistics
// @route   GET /api/privileges/:id/stats
// @access  Private/Privilege-based
router.get('/:id/stats', auth, requirePrivilege('SYSTEM_SETTINGS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) {
      return res.status(404).json({
        success: false,
        message: 'Privilege not found'
      });
    }

    // Count roles that have this privilege
    const roleCount = await Role.countDocuments({ 
      privileges: privilege._id,
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        privilegeId: privilege._id,
        privilegeName: privilege.name,
        privilegeCode: privilege.code,
        category: privilege.category,
        roleCount,
        isActive: privilege.isActive
      }
    });
  } catch (error) {
    logger.error('Error fetching privilege stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching privilege statistics'
    });
  }
}));

// @desc    Get privilege categories summary
// @route   GET /api/privileges/categories/summary
// @access  Private/Privilege-based
router.get('/categories/summary', auth, requirePrivilege('SYSTEM_SETTINGS'), asyncHandler(async (_req: express.Request, res: express.Response) => {
  try {
    const categories = await Privilege.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          privileges: {
            $push: {
              _id: '$_id',
              name: '$name',
              code: '$code',
              description: '$description'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    logger.error('Error fetching privilege categories summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching privilege categories summary'
    });
  }
}));

export default router;

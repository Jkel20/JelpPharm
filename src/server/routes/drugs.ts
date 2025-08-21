import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Drug } from '../models/Drug';
import { logger } from '../config/logger';
import { auth, requirePrivilege } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Validation middleware
const validateDrug = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Drug name must be between 2 and 200 characters'),
  body('genericName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Generic name must be between 2 and 200 characters'),
  body('manufacturer')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Manufacturer must be between 2 and 100 characters'),
  body('category')
    .isIn(['Analgesic', 'Antibiotic', 'Antiviral', 'Antifungal', 'Antihistamine', 'Antihypertensive', 'Antidiabetic', 'Other'])
    .withMessage('Invalid drug category'),
  body('dosageForm')
    .isIn(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Inhaler', 'Other'])
    .withMessage('Invalid dosage form'),
  body('strength')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Strength must be between 1 and 50 characters'),
  body('activeIngredients')
    .isArray({ min: 1 })
    .withMessage('At least one active ingredient is required'),
  body('activeIngredients.*')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Active ingredient must be between 2 and 100 characters'),
  body('prescriptionRequired')
    .isBoolean()
    .withMessage('Prescription required must be a boolean'),
  body('isControlled')
    .isBoolean()
    .withMessage('Controlled substance flag must be a boolean')
];

const validateDrugUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Drug name must be between 2 and 200 characters'),
  body('genericName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Generic name must be between 2 and 200 characters'),
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Manufacturer must be between 2 and 100 characters'),
  body('category')
    .optional()
    .isIn(['Analgesic', 'Antibiotic', 'Antiviral', 'Antifungal', 'Antihistamine', 'Antihypertensive', 'Antidiabetic', 'Other'])
    .withMessage('Invalid drug category'),
  body('dosageForm')
    .optional()
    .isIn(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Inhaler', 'Other'])
    .withMessage('Invalid dosage form'),
  body('strength')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Strength must be between 1 and 50 characters'),
  body('activeIngredients')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one active ingredient is required'),
  body('activeIngredients.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Active ingredient must be between 2 and 100 characters')
];

// @route   GET /api/drugs
// @desc    Get all drugs with filtering and pagination
// @access  Private - Requires VIEW_INVENTORY privilege
router.get('/', auth, requirePrivilege('VIEW_INVENTORY'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term must not be empty'),
  query('category').optional().isIn(['Analgesic', 'Antibiotic', 'Antiviral', 'Antifungal', 'Antihistamine', 'Antihypertensive', 'Antidiabetic', 'Other']),
  query('dosageForm').optional().isIn(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Inhaler', 'Other']),
  query('prescriptionRequired').optional().isBoolean(),
  query('isControlled').optional().isBoolean()
], asyncHandler(async (req: express.Request, res: express.Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const page = parseInt(req.query['page'] as string) || 1;
  const limit = parseInt(req.query['limit'] as string) || 20;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = { isActive: true };
  
  if (req.query['search']) {
    filter.$text = { $search: req.query['search'] as string };
  }
  
  if (req.query['category']) {
    filter.category = req.query['category'];
  }
  
  if (req.query['dosageForm']) {
    filter.dosageForm = req.query['dosageForm'];
  }
  
  if (req.query['prescriptionRequired'] !== undefined) {
    filter.prescriptionRequired = req.query['prescriptionRequired'] === 'true';
  }
  
  if (req.query['isControlled'] !== undefined) {
    filter.isControlled = req.query['isControlled'] === 'true';
  }

  // Execute query
  const [drugs, total] = await Promise.all([
    Drug.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    Drug.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      drugs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
}));

// @route   GET /api/drugs/:id
// @desc    Get drug by ID
// @access  Private - Requires VIEW_INVENTORY privilege
router.get('/:id', auth, requirePrivilege('VIEW_INVENTORY'), asyncHandler(async (req: express.Request, res: express.Response) => {
  const drug = await Drug.findById(req.params['id']);

  if (!drug) {
    return res.status(404).json({
      success: false,
      message: 'Drug not found'
    });
  }

  res.json({
    success: true,
    data: { drug }
  });
}));

// @route   POST /api/drugs
// @desc    Create new drug
// @access  Private - Requires MANAGE_INVENTORY privilege
router.post('/', auth, requirePrivilege('MANAGE_INVENTORY'), validateDrug, asyncHandler(async (req: express.Request, res: express.Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const drugData = req.body;
  
  // Check if drug already exists
  const existingDrug = await Drug.findOne({
    name: drugData.name,
    strength: drugData.strength,
    dosageForm: drugData.dosageForm,
    manufacturer: drugData.manufacturer
  });

  if (existingDrug) {
    return res.status(400).json({
      success: false,
      message: 'Drug with these specifications already exists'
    });
  }

  // Create new drug
  const drug = new Drug(drugData);
  await drug.save();

  logger.info(`New drug created: ${drug.name} by user: ${req.user?.userId}`);

  res.status(201).json({
    success: true,
    message: 'Drug created successfully',
    data: { drug }
  });
}));

// @route   PUT /api/drugs/:id
// @desc    Update drug
// @access  Private - Requires MANAGE_INVENTORY privilege
router.put('/:id', auth, requirePrivilege('MANAGE_INVENTORY'), validateDrugUpdate, asyncHandler(async (req: express.Request, res: express.Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const drugId = req.params['id'];
  const updateData = req.body;

  // Check if drug exists
  const existingDrug = await Drug.findById(drugId);
  if (!existingDrug) {
    return res.status(404).json({
      success: false,
      message: 'Drug not found'
    });
  }

  // Update drug
  const updatedDrug = await Drug.findByIdAndUpdate(
    drugId,
    updateData,
    { new: true, runValidators: true }
  );

  logger.info(`Drug updated: ${updatedDrug?.name} by user: ${req.user?.userId}`);

  res.json({
    success: true,
    message: 'Drug updated successfully',
    data: { drug: updatedDrug }
  });
}));

// @route   DELETE /api/drugs/:id
// @desc    Delete drug (soft delete)
// @access  Private - Requires MANAGE_INVENTORY privilege
router.delete('/:id', auth, requirePrivilege('MANAGE_INVENTORY'), asyncHandler(async (req: express.Request, res: express.Response) => {
  const drugId = req.params['id'];

  const drug = await Drug.findById(drugId);
  if (!drug) {
    return res.status(404).json({
      success: false,
      message: 'Drug not found'
    });
  }

  // Soft delete - set isActive to false
  drug.isActive = false;
  await drug.save();

  logger.info(`Drug deactivated: ${drug.name} by user: ${req.user?.userId}`);

  res.json({
    success: true,
    message: 'Drug deactivated successfully'
  });
}));

// @route   GET /api/drugs/search/suggestions
// @desc    Get drug search suggestions
// @access  Private - Requires VIEW_INVENTORY privilege
router.get('/search/suggestions', auth, requirePrivilege('VIEW_INVENTORY'), [
  query('q').trim().isLength({ min: 1 }).withMessage('Search query is required')
], asyncHandler(async (req: express.Request, res: express.Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const query = req.query['q'] as string;
  const limit = parseInt(req.query['limit'] as string) || 10;

  const suggestions = await Drug.find({
    $text: { $search: query },
    isActive: true
  })
    .select('name genericName strength dosageForm manufacturer')
    .limit(limit)
    .sort({ score: { $meta: 'textScore' } });

  res.json({
    success: true,
    data: { suggestions }
  });
}));

export default router;

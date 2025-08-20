/**
 * Privilege-Based Middleware Usage Examples
 * 
 * This file demonstrates how to use the new privilege-based middleware
 * for granular permission control in your routes.
 */

import express from 'express';
import { 
  // Basic privilege checking
  requirePrivilege,
  requireAllPrivileges,
  requireAnyPrivilege,
  requireCategoryPrivilege,
  
  // Predefined category middleware
  requireUserManagement,
  requireInventoryAccess,
  requireSalesAccess,
  requirePrescriptionAccess,
  requireReportAccess,
  requireSystemAccess,
  
  // Specific privilege middleware
  requireCreateUsers,
  requireEditUsers,
  requireDeleteUsers,
  requireManageInventory,
  requireAdjustStock,
  requireCreateSales,
  requireManageSales,
  requireManagePrescriptions,
  requireDispenseMedications,
  requireGenerateReports,
  requireSystemSettings,
  
  // Role-based middleware (existing)
  requireAdmin,
  requirePharmacistOrHigher,
  requireStoreManagerOrHigher,
  requireCashierOrHigher,
  
  // Store access middleware
  requireStoreAccess,
  
  // Authentication
  auth
} from '../middleware/auth';

const router = express.Router();

// ============================================================================
// BASIC PRIVILEGE CHECKING EXAMPLES
// ============================================================================

// Example 1: Single privilege check
router.get('/users', 
  auth, 
  requirePrivilege('VIEW_USERS'), 
  (req, res) => {
    // Only users with VIEW_USERS privilege can access this route
    res.json({ message: 'User list accessed' });
  }
);

// Example 2: Multiple privileges (ALL required)
router.post('/users', 
  auth, 
  requireAllPrivileges(['CREATE_USERS', 'MANAGE_INVENTORY']), 
  (req, res) => {
    // User must have BOTH CREATE_USERS AND MANAGE_INVENTORY privileges
    res.json({ message: 'User created with inventory access' });
  }
);

// Example 3: Multiple privileges (ANY required)
router.get('/reports', 
  auth, 
  requireAnyPrivilege(['VIEW_REPORTS', 'GENERATE_REPORTS']), 
  (req, res) => {
    // User must have AT LEAST ONE of these privileges
    res.json({ message: 'Reports accessed' });
  }
);

// Example 4: Category-based privilege check
router.get('/inventory', 
  auth, 
  requireCategoryPrivilege('inventory'), 
  (req, res) => {
    // User must have ANY privilege in the 'inventory' category
    res.json({ message: 'Inventory accessed' });
  }
);

// ============================================================================
// PREDEFINED CATEGORY MIDDLEWARE EXAMPLES
// ============================================================================

// Example 5: User management category
router.get('/user-management', 
  auth, 
  requireUserManagement, 
  (req, res) => {
    // User must have ANY privilege in user_management category
    res.json({ message: 'User management accessed' });
  }
);

// Example 6: Inventory access category
router.get('/inventory-management', 
  auth, 
  requireInventoryAccess, 
  (req, res) => {
    // User must have ANY privilege in inventory category
    res.json({ message: 'Inventory management accessed' });
  }
);

// Example 7: Sales access category
router.get('/sales-dashboard', 
  auth, 
  requireSalesAccess, 
  (req, res) => {
    // User must have ANY privilege in sales category
    res.json({ message: 'Sales dashboard accessed' });
  }
);

// Example 8: Prescription access category
router.get('/prescriptions', 
  auth, 
  requirePrescriptionAccess, 
  (req, res) => {
    // User must have ANY privilege in prescriptions category
    res.json({ message: 'Prescriptions accessed' });
  }
);

// Example 9: Report access category
router.get('/reports-dashboard', 
  auth, 
  requireReportAccess, 
  (req, res) => {
    // User must have ANY privilege in reports category
    res.json({ message: 'Reports dashboard accessed' });
  }
);

// Example 10: System access category
router.get('/system-settings', 
  auth, 
  requireSystemAccess, 
  (req, res) => {
    // User must have ANY privilege in system category
    res.json({ message: 'System settings accessed' });
  }
);

// ============================================================================
// SPECIFIC PRIVILEGE MIDDLEWARE EXAMPLES
// ============================================================================

// Example 11: Create users privilege
router.post('/create-user', 
  auth, 
  requireCreateUsers, 
  (req, res) => {
    // Only users with CREATE_USERS privilege
    res.json({ message: 'User creation accessed' });
  }
);

// Example 12: Edit users privilege
router.put('/edit-user/:id', 
  auth, 
  requireEditUsers, 
  (req, res) => {
    // Only users with EDIT_USERS privilege
    res.json({ message: 'User editing accessed' });
  }
);

// Example 13: Delete users privilege
router.delete('/delete-user/:id', 
  auth, 
  requireDeleteUsers, 
  (req, res) => {
    // Only users with DELETE_USERS privilege
    res.json({ message: 'User deletion accessed' });
  }
);

// Example 14: Manage inventory privilege
router.post('/inventory/add', 
  auth, 
  requireManageInventory, 
  (req, res) => {
    // Only users with MANAGE_INVENTORY privilege
    res.json({ message: 'Inventory management accessed' });
  }
);

// Example 15: Adjust stock privilege
router.post('/inventory/adjust', 
  auth, 
  requireAdjustStock, 
  (req, res) => {
    // Only users with ADJUST_STOCK privilege
    res.json({ message: 'Stock adjustment accessed' });
  }
);

// Example 16: Create sales privilege
router.post('/sales/create', 
  auth, 
  requireCreateSales, 
  (req, res) => {
    // Only users with CREATE_SALES privilege
    res.json({ message: 'Sales creation accessed' });
  }
);

// Example 17: Manage sales privilege
router.put('/sales/:id', 
  auth, 
  requireManageSales, 
  (req, res) => {
    // Only users with MANAGE_SALES privilege
    res.json({ message: 'Sales management accessed' });
  }
);

// Example 18: Manage prescriptions privilege
router.post('/prescriptions/create', 
  auth, 
  requireManagePrescriptions, 
  (req, res) => {
    // Only users with MANAGE_PRESCRIPTIONS privilege
    res.json({ message: 'Prescription management accessed' });
  }
);

// Example 19: Dispense medications privilege
router.post('/prescriptions/:id/dispense', 
  auth, 
  requireDispenseMedications, 
  (req, res) => {
    // Only users with DISPENSE_MEDICATIONS privilege
    res.json({ message: 'Medication dispensing accessed' });
  }
);

// Example 20: Generate reports privilege
router.post('/reports/generate', 
  auth, 
  requireGenerateReports, 
  (req, res) => {
    // Only users with GENERATE_REPORTS privilege
    res.json({ message: 'Report generation accessed' });
  }
);

// Example 21: System settings privilege
router.get('/admin/settings', 
  auth, 
  requireSystemSettings, 
  (req, res) => {
    // Only users with SYSTEM_SETTINGS privilege
    res.json({ message: 'System settings accessed' });
  }
);

// ============================================================================
// COMBINED MIDDLEWARE EXAMPLES
// ============================================================================

// Example 22: Role + Privilege combination
router.get('/admin/users', 
  auth, 
  requireAdmin,                    // Must be admin
  requirePrivilege('VIEW_USERS'),  // AND have VIEW_USERS privilege
  (req, res) => {
    // Admin users with VIEW_USERS privilege
    res.json({ message: 'Admin user management accessed' });
  }
);

// Example 23: Store access + Privilege combination
router.get('/store/inventory', 
  auth, 
  requireStoreAccess,              // Must have store access
  requireInventoryAccess,          // AND inventory privileges
  (req, res) => {
    // Users with store access and inventory privileges
    res.json({ message: 'Store inventory accessed' });
  }
);

// Example 24: Multiple privilege categories
router.get('/comprehensive-dashboard', 
  auth, 
  requireInventoryAccess,          // Must have inventory access
  requireSalesAccess,              // AND sales access
  requireReportAccess,             // AND report access
  (req, res) => {
    // Users with access to all three categories
    res.json({ message: 'Comprehensive dashboard accessed' });
  }
);

// Example 25: Complex privilege combination
router.post('/advanced-operation', 
  auth, 
  requireAllPrivileges(['MANAGE_INVENTORY', 'CREATE_SALES']),  // Must have both
  requireAnyPrivilege(['VIEW_REPORTS', 'GENERATE_REPORTS']),  // AND at least one of these
  requireCategoryPrivilege('system'),                         // AND system category access
  (req, res) => {
    // Complex privilege combination
    res.json({ message: 'Advanced operation accessed' });
  }
);

// ============================================================================
// CONDITIONAL PRIVILEGE CHECKING EXAMPLES
// ============================================================================

// Example 26: Conditional privilege based on request data
router.post('/conditional-access', 
  auth, 
  (req, res, next) => {
    // Custom middleware to check privileges based on request data
    const { operationType } = req.body;
    
    if (operationType === 'user_management') {
      return requireUserManagement(req, res, next);
    } else if (operationType === 'inventory') {
      return requireInventoryAccess(req, res, next);
    } else if (operationType === 'sales') {
      return requireSalesAccess(req, res, next);
    }
    
    // Default: require admin
    return requireAdmin(req, res, next);
  },
  (req, res) => {
    res.json({ message: 'Conditional access granted' });
  }
);

// Example 27: Dynamic privilege checking
router.post('/dynamic-privilege', 
  auth, 
  (req, res, next) => {
    const { requiredPrivileges } = req.body;
    
    if (Array.isArray(requiredPrivileges) && requiredPrivileges.length > 0) {
      return requireAllPrivileges(requiredPrivileges)(req, res, next);
    }
    
    // Default: require admin
    return requireAdmin(req, res, next);
  },
  (req, res) => {
    res.json({ message: 'Dynamic privilege check passed' });
  }
);

// ============================================================================
// ERROR HANDLING EXAMPLES
// ============================================================================

// Example 28: Custom error handling for privilege failures
router.get('/protected-resource', 
  auth, 
  requirePrivilege('VIEW_USERS'),
  (req, res) => {
    res.json({ message: 'Protected resource accessed' });
  },
  (error: any, req: any, res: any, next: any) => {
    if (error.statusCode === 403) {
      // Custom handling for privilege denied
      return res.status(403).json({
        success: false,
        message: 'Access denied due to insufficient privileges',
        error: 'PRIVILEGE_DENIED',
        requiredPrivilege: error.requiredPrivilege,
        userRole: req.user?.role,
        suggestion: 'Contact your administrator to request access'
      });
    }
    next(error);
  }
);

export default router;

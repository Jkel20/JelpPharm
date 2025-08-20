# Privilege-Based Middleware System

## Overview

The JelpPharm system now includes a comprehensive privilege-based middleware system that provides granular permission control beyond simple role-based access. This system allows you to control access to specific features and operations based on individual privileges rather than just user roles.

## 🏗️ Architecture

```
User → Role → Privileges → Middleware → Route Access
```

- **User**: Individual system user
- **Role**: Collection of privileges (Administrator, Pharmacist, etc.)
- **Privileges**: Granular permissions (CREATE_USERS, MANAGE_INVENTORY, etc.)
- **Middleware**: Functions that check privileges before allowing access
- **Route Access**: Protected API endpoints

## 🔐 Available Privilege Categories

### 1. User Management (`user_management`)
- `VIEW_USERS` - View user information
- `CREATE_USERS` - Create new users
- `EDIT_USERS` - Modify existing users
- `DELETE_USERS` - Remove users

### 2. Inventory Management (`inventory`)
- `VIEW_INVENTORY` - View drug inventory
- `MANAGE_INVENTORY` - Add/edit/remove inventory items
- `ADJUST_STOCK` - Adjust stock quantities

### 3. Sales Management (`sales`)
- `VIEW_SALES` - View sales records
- `CREATE_SALES` - Create new sales transactions
- `MANAGE_SALES` - Edit and manage sales

### 4. Prescriptions (`prescriptions`)
- `VIEW_PRESCRIPTIONS` - View prescription information
- `MANAGE_PRESCRIPTIONS` - Create/edit prescriptions
- `DISPENSE_MEDICATIONS` - Dispense medications

### 5. Reports (`reports`)
- `VIEW_REPORTS` - View system reports
- `GENERATE_REPORTS` - Generate and export reports

### 6. System (`system`)
- `SYSTEM_SETTINGS` - Access system settings
- `DATABASE_MANAGEMENT` - Database operations

## 🛠️ Middleware Functions

### Basic Privilege Checking

#### `requirePrivilege(privilegeCode: string)`
Checks if user has a specific privilege.

```typescript
router.get('/users', 
  auth, 
  requirePrivilege('VIEW_USERS'), 
  (req, res) => {
    // Only users with VIEW_USERS privilege
  }
);
```

#### `requireAllPrivileges(privilegeCodes: string[])`
User must have ALL specified privileges.

```typescript
router.post('/advanced-operation', 
  auth, 
  requireAllPrivileges(['CREATE_USERS', 'MANAGE_INVENTORY']), 
  (req, res) => {
    // User must have BOTH privileges
  }
);
```

#### `requireAnyPrivilege(privilegeCodes: string[])`
User must have AT LEAST ONE of the specified privileges.

```typescript
router.get('/reports', 
  auth, 
  requireAnyPrivilege(['VIEW_REPORTS', 'GENERATE_REPORTS']), 
  (req, res) => {
    // User must have at least one of these privileges
  }
);
```

#### `requireCategoryPrivilege(category: string)`
User must have ANY privilege in the specified category.

```typescript
router.get('/inventory', 
  auth, 
  requireCategoryPrivilege('inventory'), 
  (req, res) => {
    // User must have any inventory privilege
  }
);
```

### Predefined Category Middleware

#### Category Access
- `requireUserManagement` - Any user management privilege
- `requireInventoryAccess` - Any inventory privilege
- `requireSalesAccess` - Any sales privilege
- `requirePrescriptionAccess` - Any prescription privilege
- `requireReportAccess` - Any report privilege
- `requireSystemAccess` - Any system privilege

#### Specific Privilege Middleware
- `requireCreateUsers` - CREATE_USERS privilege
- `requireEditUsers` - EDIT_USERS privilege
- `requireDeleteUsers` - DELETE_USERS privilege
- `requireManageInventory` - MANAGE_INVENTORY privilege
- `requireAdjustStock` - ADJUST_STOCK privilege
- `requireCreateSales` - CREATE_SALES privilege
- `requireManageSales` - MANAGE_SALES privilege
- `requireManagePrescriptions` - MANAGE_PRESCRIPTIONS privilege
- `requireDispenseMedications` - DISPENSE_MEDICATIONS privilege
- `requireGenerateReports` - GENERATE_REPORTS privilege
- `requireSystemSettings` - SYSTEM_SETTINGS privilege

## 📝 Usage Examples

### Simple Privilege Check
```typescript
// Only users who can create users
router.post('/users', auth, requireCreateUsers, createUser);
```

### Multiple Privileges (ALL Required)
```typescript
// User must have both privileges
router.post('/inventory-with-sales', 
  auth, 
  requireAllPrivileges(['MANAGE_INVENTORY', 'CREATE_SALES']), 
  createInventoryWithSales
);
```

### Multiple Privileges (ANY Required)
```typescript
// User must have at least one privilege
router.get('/reports', 
  auth, 
  requireAnyPrivilege(['VIEW_REPORTS', 'GENERATE_REPORTS']), 
  getReports
);
```

### Category-Based Access
```typescript
// User must have any inventory privilege
router.get('/inventory-dashboard', 
  auth, 
  requireInventoryAccess, 
  getInventoryDashboard
);
```

### Combined Middleware
```typescript
// Role + Privilege combination
router.get('/admin/users', 
  auth, 
  requireAdmin,                    // Must be admin
  requirePrivilege('VIEW_USERS'),  // AND have VIEW_USERS privilege
  getAdminUsers
);
```

### Store Access + Privilege
```typescript
// Store access + specific privilege
router.get('/store/inventory', 
  auth, 
  requireStoreAccess,              // Must have store access
  requireInventoryAccess,          // AND inventory privileges
  getStoreInventory
);
```

## 🔄 Combining with Existing Middleware

### Role-Based + Privilege-Based
```typescript
router.get('/pharmacist-inventory', 
  auth, 
  requirePharmacistOrHigher,      // Role check
  requireInventoryAccess,          // Privilege check
  getPharmacistInventory
);
```

### Store Access + Privilege
```typescript
router.get('/store/sales', 
  auth, 
  requireStoreAccess,              // Store access
  requireSalesAccess,              // Sales privileges
  getStoreSales
);
```

## 🚨 Error Handling

### Privilege Denied Response
When a user lacks required privileges, the system returns:

```json
{
  "success": false,
  "message": "Access denied. Insufficient privileges for this action.",
  "requiredPrivilege": "CREATE_USERS",
  "statusCode": 403
}
```

### Multiple Privileges Denied
```json
{
  "success": false,
  "message": "Access denied. Insufficient privileges for this action.",
  "missingPrivilege": "MANAGE_INVENTORY",
  "requiredPrivileges": ["CREATE_USERS", "MANAGE_INVENTORY"],
  "statusCode": 403
}
```

### Category Access Denied
```json
{
  "success": false,
  "message": "Access denied. Insufficient privileges in this category.",
  "requiredCategory": "inventory",
  "statusCode": 403
}
```

## 📊 Logging and Monitoring

### Security Logging
All privilege checks are logged for security monitoring:

```typescript
logger.warn(`User ${req.user.userId} attempted to access resource requiring privilege: ${privilegeCode}`);
logger.warn(`User ${req.user.userId} missing required privilege: ${privilegeCode}`);
logger.warn(`User ${req.user.userId} missing privileges in category: ${category}`);
```

### Audit Trail
- Failed privilege attempts are logged
- Successful privilege checks are tracked
- User access patterns can be analyzed

## 🎯 Best Practices

### 1. Use Specific Privileges
```typescript
// ✅ Good: Specific privilege
router.post('/users', auth, requireCreateUsers, createUser);

// ❌ Avoid: Too broad
router.post('/users', auth, requireUserManagement, createUser);
```

### 2. Combine Related Privileges
```typescript
// ✅ Good: Logical combination
router.post('/inventory-operation', 
  auth, 
  requireAllPrivileges(['MANAGE_INVENTORY', 'ADJUST_STOCK']), 
  performInventoryOperation
);
```

### 3. Use Category Middleware for Dashboards
```typescript
// ✅ Good: Category access for dashboards
router.get('/inventory-dashboard', 
  auth, 
  requireInventoryAccess, 
  getInventoryDashboard
);
```

### 4. Implement Fallback Privileges
```typescript
// ✅ Good: Fallback to broader access
router.get('/data', 
  auth, 
  requireAnyPrivilege(['VIEW_INVENTORY', 'VIEW_SALES', 'VIEW_REPORTS']), 
  getData
);
```

## 🔧 Custom Privilege Middleware

### Creating Custom Privilege Checks
```typescript
export const requireCustomPrivilege = (customCheck: (user: any) => boolean) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!customCheck(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Custom privilege check failed.'
      });
    }

    next();
  };
};
```

### Usage
```typescript
router.get('/custom-resource', 
  auth, 
  requireCustomPrivilege((user) => user.role === 'Administrator' || user.storeId === 'specific-store'), 
  getCustomResource
);
```

## 📚 Migration Guide

### From Role-Only to Privilege-Based

#### Before (Role-Only)
```typescript
router.get('/users', auth, requireAdmin, getUsers);
```

#### After (Privilege-Based)
```typescript
router.get('/users', auth, requirePrivilege('VIEW_USERS'), getUsers);
```

#### Benefits
- **Granular Control**: Only users with specific privileges can access
- **Flexibility**: Different roles can have the same privilege
- **Security**: More precise access control
- **Audit**: Better tracking of user permissions

## 🚀 Performance Considerations

### Caching Privileges
Consider caching user privileges to avoid database queries on every request:

```typescript
// Cache user privileges in memory or Redis
const userPrivilegesCache = new Map();

export const requirePrivilegeCached = (privilegeCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = `${req.user.userId}-privileges`;
    
    if (userPrivilegesCache.has(cacheKey)) {
      const privileges = userPrivilegesCache.get(cacheKey);
      if (privileges.includes(privilegeCode)) {
        return next();
      }
    }
    
    // Fallback to database check
    return requirePrivilege(privilegeCode)(req, res, next);
  };
};
```

### Database Optimization
- Index privilege collections
- Use aggregation for complex privilege checks
- Consider denormalization for frequently accessed privileges

## 🔒 Security Considerations

### Privilege Escalation Prevention
- Validate privilege changes through approval workflows
- Audit all privilege modifications
- Implement least privilege principle

### Session Security
- Privilege checks on every request
- No privilege caching in client-side code
- Secure privilege storage in JWT tokens

## 📖 Additional Resources

- [Role Model Documentation](../models/Role.ts)
- [Privilege Model Documentation](../models/Privilege.ts)
- [Authentication Middleware](../middleware/auth.ts)
- [Usage Examples](../examples/privilege-usage-examples.ts)

## 🤝 Contributing

When adding new privileges or middleware:

1. **Update Privilege Model**: Add new privilege codes and categories
2. **Update Seed Data**: Include new privileges in default roles
3. **Create Middleware**: Add specific middleware if needed
4. **Update Documentation**: Document new privileges and usage
5. **Add Tests**: Test privilege checking thoroughly

---

**Note**: This privilege system provides enterprise-grade access control while maintaining flexibility and performance. Use it to implement the principle of least privilege and ensure users only have access to the features they need.

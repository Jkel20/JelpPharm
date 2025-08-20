# Role System Update - JelpPharm PMS

## Overview
The system has been updated to implement a comprehensive role-based access control (RBAC) system with only two roles: **Administrator** and **Pharmacist**.

## Changes Made

### 1. Removed Roles
- ❌ Cashier
- ❌ Store Manager

### 2. New Role System

#### Administrator Role
- **Code**: `ADMINISTRATOR`
- **Description**: Full system access with all privileges
- **Privileges**: All system privileges including:
  - User management (create, edit, delete users)
  - System settings
  - Database management
  - Full access to all modules

#### Pharmacist Role
- **Code**: `PHARMACIST`
- **Description**: Professional pharmacist with medication and inventory management privileges
- **Privileges**:
  - View users
  - Inventory management (view, manage, adjust stock)
  - Sales management (view, create, manage)
  - Prescription management (view, manage, dispense)
  - Reports (view, generate)

### 3. New Models Created

#### Privilege Model (`src/server/models/Privilege.ts`)
- Defines individual system permissions
- Categorized by functionality (user_management, inventory, sales, prescriptions, reports, system)
- Each privilege has a unique code and description

#### Role Model (`src/server/models/Role.ts`)
- Defines roles and their associated privileges
- Supports adding/removing privileges dynamically
- Includes system roles that cannot be deleted

### 4. Updated User Model
- Changed `role` field to `roleId` (ObjectId reference to Role model)
- Updated validation logic to work with new role system
- Maintains store assignment requirements

### 5. Updated Authentication
- Signup API now validates roles against the Role model
- Only accepts `ADMINISTRATOR` or `PHARMACIST` role codes
- Store information required for Pharmacist role

### 6. New Middleware
- **Privilege Middleware** (`src/server/middleware/privileges.ts`)
  - `requirePrivilege(privilegeCode)` - Check for specific privilege
  - `requireAnyPrivilege([privilegeCodes])` - Check for any of multiple privileges
  - `requireAllPrivileges([privilegeCodes])` - Check for all specified privileges

### 7. Frontend Updates
- Signup form now only shows Administrator and Pharmacist options
- Store fields are required for Pharmacist role
- Better role descriptions and validation

## Database Seeding

The system automatically seeds default roles and privileges on startup:
- Creates all privilege definitions
- Creates Administrator role with all privileges
- Creates Pharmacist role with appropriate privileges

## Usage Examples

### Checking User Privileges
```typescript
import { requirePrivilege } from '../middleware/privileges';

// Protect route with specific privilege
router.get('/users', requirePrivilege('VIEW_USERS'), getUserList);

// Protect route with multiple privilege options
router.post('/inventory', requireAnyPrivilege(['MANAGE_INVENTORY', 'ADJUST_STOCK']), updateInventory);
```

### Frontend Role Selection
```typescript
// Only these roles are available
const roles = [
  { value: 'ADMINISTRATOR', label: 'Administrator - Full system access' },
  { value: 'PHARMACIST', label: 'Pharmacist - Professional medication management' }
];
```

## Migration Notes

### For Existing Users
- Users with old roles (Cashier, Store Manager) will need to be reassigned
- Consider mapping:
  - Cashier → Pharmacist (with limited privileges)
  - Store Manager → Pharmacist (with full pharmacist privileges)

### Database Changes
- New collections: `privileges`, `roles`
- Updated `users` collection structure
- Run the seeding function to populate initial data

## Security Benefits

1. **Granular Control**: Fine-grained permission system
2. **Role Flexibility**: Easy to modify role permissions
3. **Audit Trail**: Clear privilege checking and logging
4. **Scalable**: Easy to add new roles and privileges
5. **Maintainable**: Centralized permission management

## Testing

Use the provided test script to verify the new system:
```powershell
.\test-new-roles.ps1
```

This will test:
- Administrator signup
- Pharmacist signup (with store info)
- Invalid role rejection
- JWT token generation
- Store assignment validation

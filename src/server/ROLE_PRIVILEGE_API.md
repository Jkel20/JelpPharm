# Role and Privilege Management API Documentation

## Overview

The JelpPharm system now includes a comprehensive role and privilege management system that provides granular access control. This document describes the API endpoints for managing roles and privileges.

## Base URL

```
https://jelppharm-pms.onrender.com/api
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role Management API

### Get All Roles

**GET** `/roles`

Returns all active roles with their privileges.

**Required Privilege:** `VIEW_USERS`

**Response:**
```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "_id": "role-id",
      "name": "Administrator",
      "description": "Full system access with all privileges...",
      "code": "ADMINISTRATOR",
      "privileges": [
        {
          "_id": "privilege-id",
          "name": "View Users",
          "code": "VIEW_USERS",
          "category": "user_management",
          "description": "Can view user information and lists"
        }
      ],
      "isActive": true,
      "isSystem": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Role by ID

**GET** `/roles/:id`

Returns a specific role by ID.

**Required Privilege:** `VIEW_USERS`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "role-id",
    "name": "Pharmacist",
    "description": "Professional pharmacist with comprehensive medication...",
    "code": "PHARMACIST",
    "privileges": [...],
    "isActive": true,
    "isSystem": true
  }
}
```

### Create New Role

**POST** `/roles`

Creates a new custom role.

**Required Privileges:** `CREATE_USERS` AND `SYSTEM_SETTINGS`

**Request Body:**
```json
{
  "name": "Custom Role",
  "description": "A custom role with specific privileges",
  "code": "CUSTOM_ROLE",
  "privileges": ["privilege-id-1", "privilege-id-2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "_id": "new-role-id",
    "name": "Custom Role",
    "code": "CUSTOM_ROLE",
    "privileges": [...],
    "isActive": true,
    "isSystem": false
  }
}
```

### Update Role

**PUT** `/roles/:id`

Updates an existing role.

**Required Privileges:** `EDIT_USERS` AND `SYSTEM_SETTINGS`

**Note:** System roles cannot be modified.

**Request Body:**
```json
{
  "name": "Updated Role Name",
  "description": "Updated description",
  "privileges": ["privilege-id-1", "privilege-id-2"]
}
```

### Delete Role

**DELETE** `/roles/:id`

Deletes a custom role.

**Required Privileges:** `DELETE_USERS` AND `SYSTEM_SETTINGS`

**Note:** System roles cannot be deleted. Roles assigned to users cannot be deleted.

### Toggle Role Status

**PATCH** `/roles/:id/toggle-status`

Activates or deactivates a role.

**Required Privileges:** `EDIT_USERS` AND `SYSTEM_SETTINGS`

**Note:** System roles cannot be deactivated.

### Get Role Statistics

**GET** `/roles/:id/stats`

Returns statistics for a specific role.

**Required Privilege:** `VIEW_USERS`

**Response:**
```json
{
  "success": true,
  "data": {
    "roleId": "role-id",
    "roleName": "Pharmacist",
    "roleCode": "PHARMACIST",
    "userCount": 5,
    "privilegeCount": 12,
    "isActive": true,
    "isSystem": true
  }
}
```

## Privilege Management API

### Get All Privileges

**GET** `/privileges`

Returns all active privileges.

**Required Privilege:** `SYSTEM_SETTINGS`

**Response:**
```json
{
  "success": true,
  "count": 18,
  "data": [
    {
      "_id": "privilege-id",
      "name": "View Users",
      "description": "Can view user information and lists",
      "code": "VIEW_USERS",
      "category": "user_management",
      "isActive": true
    }
  ]
}
```

### Get Privileges by Category

**GET** `/privileges/category/:category`

Returns privileges filtered by category.

**Required Privilege:** `SYSTEM_SETTINGS`

**Categories:** `user_management`, `inventory`, `sales`, `prescriptions`, `reports`, `system`

**Response:**
```json
{
  "success": true,
  "count": 4,
  "category": "user_management",
  "data": [
    {
      "_id": "privilege-id",
      "name": "View Users",
      "code": "VIEW_USERS",
      "category": "user_management"
    }
  ]
}
```

### Get Privilege by ID

**GET** `/privileges/:id`

Returns a specific privilege by ID.

**Required Privilege:** `SYSTEM_SETTINGS`

### Create New Privilege

**POST** `/privileges`

Creates a new privilege.

**Required Privilege:** `SYSTEM_SETTINGS`

**Request Body:**
```json
{
  "name": "Custom Privilege",
  "description": "A custom privilege for specific operations",
  "code": "CUSTOM_PRIVILEGE",
  "category": "inventory"
}
```

### Update Privilege

**PUT** `/privileges/:id`

Updates an existing privilege.

**Required Privilege:** `SYSTEM_SETTINGS`

**Request Body:**
```json
{
  "name": "Updated Privilege Name",
  "description": "Updated description",
  "category": "sales"
}
```

### Delete Privilege

**DELETE** `/privileges/:id`

Deletes a privilege.

**Required Privilege:** `SYSTEM_SETTINGS`

**Note:** Privileges assigned to active roles cannot be deleted.

### Toggle Privilege Status

**PATCH** `/privileges/:id/toggle-status`

Activates or deactivates a privilege.

**Required Privilege:** `SYSTEM_SETTINGS`

### Get Privilege Statistics

**GET** `/privileges/:id/stats`

Returns statistics for a specific privilege.

**Required Privilege:** `SYSTEM_SETTINGS`

**Response:**
```json
{
  "success": true,
  "data": {
    "privilegeId": "privilege-id",
    "privilegeName": "Manage Inventory",
    "privilegeCode": "MANAGE_INVENTORY",
    "category": "inventory",
    "roleCount": 3,
    "isActive": true
  }
}
```

### Get Privilege Categories Summary

**GET** `/privileges/categories/summary`

Returns a summary of all privilege categories.

**Required Privilege:** `SYSTEM_SETTINGS`

**Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "user_management",
      "count": 4,
      "privileges": [
        {
          "_id": "privilege-id",
          "name": "View Users",
          "code": "VIEW_USERS",
          "description": "Can view user information and lists"
        }
      ]
    }
  ]
}
```

## Predefined Roles

The system comes with the following predefined roles:

### 1. Administrator
- **Code:** `ADMINISTRATOR`
- **Description:** Full system access with all privileges
- **Privileges:** All system privileges
- **Use Case:** System administrators and IT managers

### 2. Pharmacist
- **Code:** `PHARMACIST`
- **Description:** Professional pharmacist with comprehensive medication and inventory management privileges
- **Privileges:** User viewing, inventory management, sales, prescriptions, reports
- **Use Case:** Licensed pharmacists

### 3. Store Manager
- **Code:** `STORE_MANAGER`
- **Description:** Store-level manager with oversight of operations, staff, and business performance
- **Privileges:** User management, inventory, sales, prescriptions, reports
- **Use Case:** Store managers

### 4. Cashier
- **Code:** `CASHIER`
- **Description:** Front-line staff member responsible for sales transactions and customer service
- **Privileges:** View inventory, create sales, view prescriptions, view reports
- **Use Case:** Cashiers and sales assistants

### 5. Inventory Specialist
- **Code:** `INVENTORY_SPECIALIST`
- **Description:** Staff member focused on inventory management and stock control
- **Privileges:** Inventory management, stock adjustment, reports
- **Use Case:** Inventory management staff

### 6. Sales Representative
- **Code:** `SALES_REPRESENTATIVE`
- **Description:** Staff member focused on sales and customer relationships
- **Privileges:** Sales management, inventory viewing, prescriptions, reports
- **Use Case:** Sales staff

### 7. Data Analyst
- **Code:** `DATA_ANALYST`
- **Description:** Staff member focused on reporting and data analysis
- **Privileges:** View all data, generate reports, export data
- **Use Case:** Business analysts and reporting staff

## Privilege Categories

### User Management (`user_management`)
- `VIEW_USERS` - View user information
- `CREATE_USERS` - Create new users
- `EDIT_USERS` - Modify existing users
- `DELETE_USERS` - Remove users

### Inventory Management (`inventory`)
- `VIEW_INVENTORY` - View drug inventory
- `MANAGE_INVENTORY` - Add/edit/remove inventory items
- `ADJUST_STOCK` - Adjust stock quantities

### Sales Management (`sales`)
- `VIEW_SALES` - View sales records
- `CREATE_SALES` - Create new sales transactions
- `MANAGE_SALES` - Edit and manage sales

### Prescriptions (`prescriptions`)
- `VIEW_PRESCRIPTIONS` - View prescription information
- `MANAGE_PRESCRIPTIONS` - Create/edit prescriptions
- `DISPENSE_MEDICATIONS` - Dispense medications

### Reports (`reports`)
- `VIEW_REPORTS` - View system reports
- `GENERATE_REPORTS` - Generate and export reports

### System (`system`)
- `SYSTEM_SETTINGS` - Access system settings
- `DATABASE_MANAGEMENT` - Database operations

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token, authorization denied"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient privileges for this action.",
  "requiredPrivilege": "CREATE_USERS"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Role not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error message"
}
```

## Usage Examples

### Creating a Custom Role
```bash
curl -X POST https://jelppharm-pms.onrender.com/api/roles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Junior Pharmacist",
    "description": "Entry-level pharmacist with limited privileges",
    "code": "JUNIOR_PHARMACIST",
    "privileges": ["privilege-id-1", "privilege-id-2"]
  }'
```

### Updating Role Privileges
```bash
curl -X PUT https://jelppharm-pms.onrender.com/api/roles/role-id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "privileges": ["privilege-id-1", "privilege-id-2", "privilege-id-3"]
  }'
```

### Getting Role Statistics
```bash
curl -X GET https://jelppharm-pms.onrender.com/api/roles/role-id/stats \
  -H "Authorization: Bearer <token>"
```

## Security Considerations

1. **Privilege Escalation Prevention:** Only users with `SYSTEM_SETTINGS` privilege can manage roles and privileges
2. **System Role Protection:** System roles cannot be modified or deleted
3. **Dependency Checking:** Roles and privileges cannot be deleted if they're assigned to active users/roles
4. **Audit Logging:** All role and privilege changes are logged for security monitoring

## Best Practices

1. **Principle of Least Privilege:** Assign only the privileges users need to perform their jobs
2. **Regular Review:** Periodically review and update role assignments
3. **Documentation:** Maintain clear documentation of role responsibilities and privilege assignments
4. **Testing:** Test privilege changes in a development environment before applying to production
5. **Backup:** Keep backups of role and privilege configurations

## Integration with Existing System

The role and privilege system integrates with:

- **User Management:** Users are assigned roles which determine their privileges
- **Authentication Middleware:** All routes use privilege-based access control
- **Logging System:** All privilege checks and changes are logged
- **Error Handling:** Consistent error responses across all endpoints

This system provides enterprise-grade access control while maintaining flexibility and performance for the JelpPharm pharmacy management system.

import mongoose from 'mongoose';
import { Role } from '../models/Role';
import { Privilege } from '../models/Privilege';
import { logger } from '../config/logger';

// Define default privileges
const defaultPrivileges = [
  // User Management
  {
    name: 'View Users',
    description: 'Can view user information and lists',
    code: 'VIEW_USERS',
    category: 'user_management'
  },
  {
    name: 'Create Users',
    description: 'Can create new users in the system',
    code: 'CREATE_USERS',
    category: 'user_management'
  },
  {
    name: 'Edit Users',
    description: 'Can modify existing user information',
    code: 'EDIT_USERS',
    category: 'user_management'
  },
  {
    name: 'Delete Users',
    description: 'Can remove users from the system',
    code: 'DELETE_USERS',
    category: 'user_management'
  },
  
  // Inventory Management
  {
    name: 'View Inventory',
    description: 'Can view drug inventory and stock levels',
    code: 'VIEW_INVENTORY',
    category: 'inventory'
  },
  {
    name: 'Manage Inventory',
    description: 'Can add, edit, and remove inventory items',
    code: 'MANAGE_INVENTORY',
    category: 'inventory'
  },
  {
    name: 'Adjust Stock',
    description: 'Can adjust stock quantities and manage stock movements',
    code: 'ADJUST_STOCK',
    category: 'inventory'
  },
  
  // Sales Management
  {
    name: 'View Sales',
    description: 'Can view sales records and transactions',
    code: 'VIEW_SALES',
    category: 'sales'
  },
  {
    name: 'Create Sales',
    description: 'Can create new sales transactions',
    code: 'CREATE_SALES',
    category: 'sales'
  },
  {
    name: 'Manage Sales',
    description: 'Can edit and manage sales transactions',
    code: 'MANAGE_SALES',
    category: 'sales'
  },
  
  // Prescriptions
  {
    name: 'View Prescriptions',
    description: 'Can view prescription information',
    code: 'VIEW_PRESCRIPTIONS',
    category: 'prescriptions'
  },
  {
    name: 'Manage Prescriptions',
    description: 'Can create, edit, and manage prescriptions',
    code: 'MANAGE_PRESCRIPTIONS',
    category: 'prescriptions'
  },
  {
    name: 'Dispense Medications',
    description: 'Can dispense medications and update prescription status',
    code: 'DISPENSE_MEDICATIONS',
    category: 'prescriptions'
  },
  
  // Reports
  {
    name: 'View Reports',
    description: 'Can view system reports and analytics',
    code: 'VIEW_REPORTS',
    category: 'reports'
  },
  {
    name: 'Generate Reports',
    description: 'Can generate and export reports',
    code: 'GENERATE_REPORTS',
    category: 'reports'
  },
  
  // System
  {
    name: 'System Settings',
    description: 'Can access and modify system settings',
    code: 'SYSTEM_SETTINGS',
    category: 'system'
  },
  {
    name: 'Database Management',
    description: 'Can perform database operations and maintenance',
    code: 'DATABASE_MANAGEMENT',
    category: 'system'
  }
];

// Define default roles with their privileges
const defaultRoles: Array<{
  name: string;
  description: string;
  code: string;
  privileges: mongoose.Types.ObjectId[];
  isSystem: boolean;
}> = [
  {
    name: 'Administrator',
    description: 'Full system access with all privileges',
    code: 'ADMINISTRATOR',
    privileges: [], // Will be populated with all privileges
    isSystem: true
  },
  {
    name: 'Pharmacist',
    description: 'Professional pharmacist with medication and inventory management privileges',
    code: 'PHARMACIST',
    privileges: [], // Will be populated with specific privileges
    isSystem: true
  }
];

export async function seedRolesAndPrivileges() {
  try {
    logger.info('Starting to seed roles and privileges...');
    
    // Create privileges first
    const createdPrivileges: any[] = [];
    for (const privilegeData of defaultPrivileges) {
      const existingPrivilege = await Privilege.findOne({ code: privilegeData.code });
      if (!existingPrivilege) {
        const privilege = new Privilege(privilegeData);
        await privilege.save();
        createdPrivileges.push(privilege);
        logger.info(`Created privilege: ${privilege.code}`);
      } else {
        createdPrivileges.push(existingPrivilege);
        logger.info(`Privilege already exists: ${existingPrivilege.code}`);
      }
    }
    
    // Get all privilege IDs for administrator
    const allPrivilegeIds = createdPrivileges.map(p => p._id);
    
    // Get specific privileges for pharmacist
    const pharmacistPrivilegeCodes = [
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
    ];
    
    const pharmacistPrivilegeIds = createdPrivileges
      .filter(p => pharmacistPrivilegeCodes.includes(p.code))
      .map(p => p._id);
    
    // Create or update roles
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ code: roleData.code });
      
      if (roleData.code === 'ADMINISTRATOR') {
        roleData.privileges = allPrivilegeIds;
      } else if (roleData.code === 'PHARMACIST') {
        roleData.privileges = pharmacistPrivilegeIds;
      }
      
      if (existingRole) {
        // Update existing role with new privileges
        existingRole.privileges = roleData.privileges;
        await existingRole.save();
        logger.info(`Updated role: ${existingRole.code}`);
      } else {
        // Create new role
        const role = new Role(roleData);
        await role.save();
        logger.info(`Created role: ${role.code}`);
      }
    }
    
    logger.info('Successfully seeded roles and privileges');
    
  } catch (error) {
    logger.error('Error seeding roles and privileges:', error);
    throw error;
  }
}

// Function to get role by code
export async function getRoleByCode(code: string) {
  try {
    const role = await Role.findOne({ code, isActive: true }).populate('privileges');
    return role;
  } catch (error) {
    logger.error(`Error getting role by code ${code}:`, error);
    throw error;
  }
}

// Function to check if user has privilege
export async function userHasPrivilege(userId: string, privilegeCode: string): Promise<boolean> {
  try {
    const user = await mongoose.model('User').findById(userId).populate({
      path: 'roleId',
      populate: {
        path: 'privileges'
      }
    });
    
    if (!user || !user.roleId) {
      return false;
    }
    
    const role = user.roleId as any;
    return role.privileges.some((privilege: any) => privilege.code === privilegeCode);
  } catch (error) {
    logger.error(`Error checking user privilege:`, error);
    return false;
  }
}

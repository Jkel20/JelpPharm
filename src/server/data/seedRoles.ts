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
  
  // Store Management
  {
    name: 'View Stores',
    description: 'Can view store information and lists',
    code: 'VIEW_STORES',
    category: 'store_management'
  },
  {
    name: 'Create Stores',
    description: 'Can create new stores in the system',
    code: 'CREATE_STORES',
    category: 'store_management'
  },
  {
    name: 'Edit Stores',
    description: 'Can modify existing store information',
    code: 'EDIT_STORES',
    category: 'store_management'
  },
  {
    name: 'Delete Stores',
    description: 'Can remove stores from the system',
    code: 'DELETE_STORES',
    category: 'store_management'
  },
  
  // Drug Management
  {
    name: 'View Drugs',
    description: 'Can view drug information and lists',
    code: 'VIEW_DRUGS',
    category: 'drug_management'
  },
  {
    name: 'Create Drugs',
    description: 'Can create new drugs in the system',
    code: 'CREATE_DRUGS',
    category: 'drug_management'
  },
  {
    name: 'Edit Drugs',
    description: 'Can modify existing drug information',
    code: 'EDIT_DRUGS',
    category: 'drug_management'
  },
  {
    name: 'Delete Drugs',
    description: 'Can remove drugs from the system',
    code: 'DELETE_DRUGS',
    category: 'drug_management'
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
    description: 'Full system access with all privileges. Can manage users, roles, privileges, system settings, and access all features. This role is designed for system administrators and IT managers who need complete control over the pharmacy management system.',
    code: 'ADMINISTRATOR',
    privileges: [], // Will be populated with all privileges
    isSystem: true
  },
  {
    name: 'Pharmacist',
    description: 'Professional pharmacist with comprehensive medication and inventory management privileges. Can manage prescriptions, dispense medications, manage inventory, create sales, and generate reports. This role is designed for licensed pharmacists who need full access to pharmaceutical operations.',
    code: 'PHARMACIST',
    privileges: [], // Will be populated with specific privileges
    isSystem: true
  },
  {
    name: 'Store Manager',
    description: 'Store-level manager with oversight of operations, staff, and business performance. Can manage inventory, sales, prescriptions, users within their store, and generate comprehensive reports. This role is designed for store managers who need to oversee all aspects of pharmacy operations.',
    code: 'STORE_MANAGER',
    privileges: [], // Will be populated with specific privileges
    isSystem: true
  },
  {
    name: 'Cashier',
    description: 'Front-line staff member responsible for sales transactions and customer service. Can create sales, view inventory, process prescriptions, and generate basic reports. This role is designed for cashiers and sales assistants who handle customer transactions.',
    code: 'CASHIER',
    privileges: [], // Will be populated with specific privileges
    isSystem: true
  },

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
    
    // Define privilege assignments for each role
    const rolePrivilegeAssignments = {
      'ADMINISTRATOR': allPrivilegeIds, // All privileges
      
      'PHARMACIST': createdPrivileges
        .filter(p => [
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
          'GENERATE_REPORTS',
          'VIEW_STORES',
          'VIEW_DRUGS',
          'CREATE_DRUGS',
          'EDIT_DRUGS'
        ].includes(p.code))
        .map(p => p._id),
      
      'STORE_MANAGER': createdPrivileges
        .filter(p => [
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
          'GENERATE_REPORTS',
          'VIEW_STORES',
          'CREATE_STORES',
          'EDIT_STORES',
          'VIEW_DRUGS',
          'CREATE_DRUGS',
          'EDIT_DRUGS'
        ].includes(p.code))
        .map(p => p._id),
      
      'CASHIER': createdPrivileges
        .filter(p => [
          'VIEW_INVENTORY',
          'VIEW_SALES',
          'CREATE_SALES',
          'VIEW_PRESCRIPTIONS',
          'VIEW_REPORTS',
          'VIEW_STORES',
          'VIEW_DRUGS'
        ].includes(p.code))
        .map(p => p._id)
    };
    
    // Create or update roles
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ code: roleData.code });
      
      // Assign privileges based on role code
      roleData.privileges = rolePrivilegeAssignments[roleData.code as keyof typeof rolePrivilegeAssignments] || [];
      
      if (existingRole) {
        // Update existing role with new privileges
        existingRole.privileges = roleData.privileges;
        await existingRole.save();
        logger.info(`Updated role: ${existingRole.code} with ${roleData.privileges.length} privileges`);
      } else {
        // Create new role
        const role = new Role(roleData);
        await role.save();
        logger.info(`Created role: ${role.code} with ${roleData.privileges.length} privileges`);
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
    // Get the user with role and privileges populated
    const user = await mongoose.model('User').findById(userId).populate({
      path: 'roleId',
      populate: {
        path: 'privileges'
      }
    });
    
    if (!user || !user.roleId) {
      logger.warn(`User ${userId} not found or has no role assigned`);
      return false;
    }
    
    const role = user.roleId as any;
    
    // Check if role has the required privilege
    const hasPrivilege = role.privileges.some((privilege: any) => privilege.code === privilegeCode);
    
    if (!hasPrivilege) {
      logger.debug(`User ${userId} with role ${role.code} does not have privilege ${privilegeCode}`);
    }
    
    return hasPrivilege;
  } catch (error) {
    logger.error(`Error checking user privilege for user ${userId}:`, error);
    return false;
  }
}

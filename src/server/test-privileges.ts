import mongoose from 'mongoose';
import { userHasPrivilege, getRoleByCode } from './data/seedRoles';
import { User } from './models/User';
import { Role } from './models/Role';
import { Privilege } from './models/Privilege';
import { logger } from './config/logger';

// Test the privilege system
async function testPrivilegeSystem() {
  try {
    logger.info('Testing privilege system...');
    
    // Test 1: Check if roles exist
    const roles = await Role.find().populate('privileges');
    logger.info(`Found ${roles.length} roles:`);
    roles.forEach(role => {
      logger.info(`- ${role.code}: ${role.privileges.length} privileges`);
    });
    
    // Test 2: Check if privileges exist
    const privileges = await Privilege.find();
    logger.info(`Found ${privileges.length} privileges:`);
    privileges.forEach(privilege => {
      logger.info(`- ${privilege.code}: ${privilege.name}`);
    });
    
    // Test 3: Check a specific role
    const pharmacistRole = await getRoleByCode('PHARMACIST');
    if (pharmacistRole) {
      logger.info(`Pharmacist role has ${pharmacistRole.privileges.length} privileges:`);
      pharmacistRole.privileges.forEach((privilege: any) => {
        logger.info(`  - ${privilege.code}: ${privilege.name}`);
      });
    }
    
    // Test 4: Check if users exist and have roles
    const users = await User.find().populate('roleId');
    logger.info(`Found ${users.length} users:`);
    users.forEach(user => {
      const role = user.roleId as any;
      logger.info(`- ${user.email}: role ${role?.code || 'NO_ROLE'}`);
    });
    
    // Test 5: Test privilege checking for a specific user
    if (users.length > 0) {
      const testUser = users[0];
      const testUserId = testUser._id.toString();
      
      logger.info(`Testing privileges for user: ${testUser.email}`);
      
      const hasViewInventory = await userHasPrivilege(testUserId, 'VIEW_INVENTORY');
      const hasManageInventory = await userHasPrivilege(testUserId, 'MANAGE_INVENTORY');
      const hasCreateUsers = await userHasPrivilege(testUserId, 'CREATE_USERS');
      
      logger.info(`- VIEW_INVENTORY: ${hasViewInventory}`);
      logger.info(`- MANAGE_INVENTORY: ${hasManageInventory}`);
      logger.info(`- CREATE_USERS: ${hasCreateUsers}`);
    }
    
    logger.info('Privilege system test completed');
    
  } catch (error) {
    logger.error('Error testing privilege system:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jelppharm';
  
  mongoose.connect(mongoUri)
    .then(() => {
      logger.info('Connected to MongoDB');
      return testPrivilegeSystem();
    })
    .then(() => {
      logger.info('Test completed, disconnecting...');
      return mongoose.disconnect();
    })
    .catch((error) => {
      logger.error('Test failed:', error);
      process.exit(1);
    });
}

export { testPrivilegeSystem };

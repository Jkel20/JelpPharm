import express from 'express';
import { Drug } from '../models/Drug';
import { Sale } from '../models/Sale';
import { Prescription } from '../models/Prescription';
import { User } from '../models/User';
import { Inventory } from '../models/Inventory';
import { auth, requirePrivilege, requireCategoryPrivilege } from '../middleware/auth';
import { logger } from '../config/logger';

const router = express.Router();

// TypeScript interfaces
interface Alert {
  type: string;
  title: string;
  message: string;
  severity: 'danger' | 'warning' | 'info';
  drugs?: Array<{
    name: string;
    quantity: number;
    reorderLevel?: number;
    expiryDate?: Date;
  }>;
}

interface Activity {
  id: string;
  action: string;
  item: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  timestamp: Date;
}

// Get dashboard statistics
router.get('/stats', auth, requirePrivilege('VIEW_REPORTS'), async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total drugs count
    const totalDrugs = await Drug.countDocuments();
    const lastMonthDrugs = await Drug.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });
    const thisMonthDrugs = await Drug.countDocuments({
      createdAt: { $gte: startOfThisMonth }
    });
    const drugsChange = lastMonthDrugs > 0 ? 
      Math.round(((thisMonthDrugs - lastMonthDrugs) / lastMonthDrugs) * 100) : 0;

    // Today's sales
    const todaySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const todaySalesAmount = todaySales.length > 0 ? todaySales[0].total : 0;

    const yesterdaySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfYesterday, $lt: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const yesterdaySalesAmount = yesterdaySales.length > 0 ? yesterdaySales[0].total : 0;
    const salesChange = yesterdaySalesAmount > 0 ? 
      Math.round(((todaySalesAmount - yesterdaySalesAmount) / yesterdaySalesAmount) * 100) : 0;

    // Active prescriptions
    const activePrescriptions = await Prescription.countDocuments({ status: 'active' });
    const lastWeekPrescriptions = await Prescription.countDocuments({
      createdAt: { $gte: startOfLastWeek }
    });
    const prescriptionsChange = lastWeekPrescriptions > 0 ? 
      Math.round(((activePrescriptions - lastWeekPrescriptions) / lastWeekPrescriptions) * 100) : 0;

    // Registered users
    const totalUsers = await User.countDocuments();
    const thisMonthUsers = await User.countDocuments({
      createdAt: { $gte: startOfThisMonth }
    });

    res.json({
      totalDrugs: {
        value: totalDrugs.toLocaleString(),
        change: `${drugsChange >= 0 ? '+' : ''}${drugsChange}% from last month`
      },
      todaySales: {
        value: `₵${todaySalesAmount.toLocaleString()}`,
        change: `${salesChange >= 0 ? '+' : ''}${salesChange}% from yesterday`
      },
      activePrescriptions: {
        value: activePrescriptions,
        change: `${prescriptionsChange >= 0 ? '+' : ''}${prescriptionsChange}% from last week`
      },
      registeredUsers: {
        value: totalUsers,
        change: `+${thisMonthUsers} this month`
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Get low stock alerts
router.get('/alerts', auth, requirePrivilege('VIEW_REPORTS'), async (req, res) => {
  try {
    // Get low stock inventory items with drug names
    const lowStockInventory = await Inventory.aggregate([
      {
        $match: {
          $or: [
            { quantity: { $lte: 10 } },
            { quantity: { $lte: 20, $gt: 10 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'drugs',
          localField: 'drug',
          foreignField: '_id',
          as: 'drugInfo'
        }
      },
      {
        $unwind: '$drugInfo'
      },
      {
        $project: {
          name: '$drugInfo.name',
          quantity: '$quantity',
          reorderPoint: '$reorderPoint'
        }
      }
    ]).limit(5);

    const alerts: Alert[] = [];
    
    if (lowStockInventory.length > 0) {
      alerts.push({
        type: 'lowStock',
        title: 'Low Stock Alert',
        message: `${lowStockInventory.length} medications are running low on stock. Please review inventory and place reorders to ensure continuous service.`,
        severity: 'warning',
        drugs: lowStockInventory.map(item => ({
          name: item.name,
          quantity: item.quantity,
          reorderLevel: item.reorderPoint
        }))
      });
    }

    // Check for expired drugs
    const expiredInventory = await Inventory.aggregate([
      {
        $match: {
          'batches.expiryDate': { $lte: new Date() }
        }
      },
      {
        $lookup: {
          from: 'drugs',
          localField: 'drug',
          foreignField: '_id',
          as: 'drugInfo'
        }
      },
      {
        $unwind: '$drugInfo'
      },
      {
        $project: {
          name: '$drugInfo.name',
          quantity: '$quantity',
          expiryDate: { $min: '$batches.expiryDate' }
        }
      }
    ]).limit(3);

    if (expiredInventory.length > 0) {
      alerts.push({
        type: 'expired',
        title: 'Expired Drugs Alert',
        message: `${expiredInventory.length} medications have expired. Please remove them from inventory immediately.`,
        severity: 'danger',
        drugs: expiredInventory.map(item => ({
          name: item.name,
          quantity: item.quantity,
          expiryDate: item.expiryDate
        }))
      });
    }

    // Check for expiring soon drugs (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringSoonInventory = await Inventory.aggregate([
      {
        $match: {
          'batches.expiryDate': { 
            $gte: new Date(), 
            $lte: thirtyDaysFromNow 
          }
        }
      },
      {
        $lookup: {
          from: 'drugs',
          localField: 'drug',
          foreignField: '_id',
          as: 'drugInfo'
        }
      },
      {
        $unwind: '$drugInfo'
      },
      {
        $project: {
          name: '$drugInfo.name',
          quantity: '$quantity',
          expiryDate: { $min: '$batches.expiryDate' }
        }
      }
    ]).limit(3);

    if (expiringSoonInventory.length > 0) {
      alerts.push({
        type: 'expiringSoon',
        title: 'Expiring Soon Alert',
        message: `${expiringSoonInventory.length} medications will expire within 30 days. Please prioritize their use.`,
        severity: 'info',
        drugs: expiringSoonInventory.map(item => ({
          name: item.name,
          quantity: item.quantity,
          expiryDate: item.expiryDate
        }))
      });
    }

    res.json({ alerts });
  } catch (error) {
    logger.error('Error fetching dashboard alerts:', error);
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

// Get recent activities
router.get('/recent-activities', auth, requirePrivilege('VIEW_REPORTS'), async (req, res) => {
  try {
    const activities: Activity[] = [];

    // Recent drug additions
    const recentDrugs = await Drug.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name createdAt');

    recentDrugs.forEach(drug => {
      const timeAgo = getTimeAgo(drug.createdAt);
      activities.push({
        id: `drug-${drug._id}`,
        action: 'New drug added',
        item: drug.name,
        time: timeAgo,
        type: 'success',
        timestamp: drug.createdAt
      });
    });

    // Recent sales
    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('totalAmount createdAt');

    recentSales.forEach(sale => {
      const timeAgo = getTimeAgo(sale.createdAt);
      activities.push({
        id: `sale-${sale._id}`,
        action: 'Sale completed',
        item: `₵${sale.totalAmount.toFixed(2)}`,
        time: timeAgo,
        type: 'success',
        timestamp: sale.createdAt
      });
    });

    // Recent prescriptions
    const recentPrescriptions = await Prescription.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('diagnosis status createdAt');

    recentPrescriptions.forEach(prescription => {
      const timeAgo = getTimeAgo(prescription.createdAt);
      activities.push({
        id: `prescription-${prescription._id}`,
        action: prescription.status === 'completed' ? 'Prescription filled' : 'Prescription created',
        item: `Diagnosis: ${prescription.diagnosis}`,
        time: timeAgo,
        type: 'info',
        timestamp: prescription.createdAt
      });
    });

    // Recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select('fullName roleId createdAt')
      .populate('roleId', 'code');

    recentUsers.forEach(user => {
      const timeAgo = getTimeAgo(user.createdAt);
      activities.push({
        id: `user-${user._id}`,
        action: 'User registered',
        item: `${(user.roleId as any)?.code || 'Unknown'}: ${user.fullName}`,
        time: timeAgo,
        type: 'info',
        timestamp: user.createdAt
      });
    });

    // Sort all activities by timestamp and take the most recent 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(activity => ({
        id: activity.id,
        action: activity.action,
        item: activity.item,
        time: activity.time,
        type: activity.type
      }));

    res.json({ activities: sortedActivities });
  } catch (error) {
    logger.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Error fetching recent activities' });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

// ========================================
// ROLE-SPECIFIC DASHBOARD ENDPOINTS WITH RESTRICTIONS
// =====================================================

// Administrator Dashboard - Full system access (SYSTEM_SETTINGS privilege required)
router.get('/admin', auth, requirePrivilege('SYSTEM_SETTINGS'), async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // System-wide statistics (only admins can see)
    const totalUsers = await User.countDocuments();
    const totalRoles = await User.aggregate([
      { $group: { _id: '$roleId', count: { $sum: 1 } } },
      { $count: 'total' }
    ]);
    const totalStores = await User.aggregate([
      { $group: { _id: '$storeId', count: { $sum: 1 } } },
      { $count: 'total' }
    ]);

    // Financial overview (admin privilege)
    const monthlySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const monthlySalesAmount = monthlySales.length > 0 ? monthlySales[0].total : 0;

    // System health monitoring (admin privilege)
    const lowStockItems = await Inventory.countDocuments({ 
      $expr: { $lte: ['$quantity', '$reorderPoint'] } 
    });
    const expiringItems = await Inventory.countDocuments({
      'batches.expiryDate': { 
        $gte: new Date(), 
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      }
    });

    // Recent system activities (admin privilege)
    const recentSystemActivities = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName roleId createdAt')
      .populate('roleId', 'code');

    res.json({
      success: true,
      message: '🎯 ADMINISTRATOR DASHBOARD ACCESS GRANTED!',
      role: 'Administrator',
      requiredPrivilege: 'SYSTEM_SETTINGS',
      privileges: ['Full system access', 'User management', 'System settings', 'All reports', 'Database management'],
      accessLevel: 'SYSTEM_ADMIN',
      restrictions: 'None - Full access to all features',
      statistics: {
        system: {
          totalUsers,
          totalRoles: totalRoles.length > 0 ? totalRoles[0].total : 0,
          totalStores: totalStores.length > 0 ? totalStores[0].total : 0
        },
        financial: {
          monthlySales: `₵${monthlySalesAmount.toLocaleString()}`,
          monthlySalesRaw: monthlySalesAmount
        },
        alerts: {
          lowStockItems,
          expiringItems
        }
      },
      recentActivities: recentSystemActivities.map(user => ({
        action: 'User registered',
        details: `${(user.roleId as any)?.code || 'Unknown'}: ${user.fullName}`,
        time: getTimeAgo(user.createdAt)
      })),
      quickActions: [
        { name: 'Manage Users', endpoint: '/api/users', method: 'GET', privilege: 'VIEW_USERS' },
        { name: 'Manage Roles', endpoint: '/api/roles', method: 'GET', privilege: 'SYSTEM_SETTINGS' },
        { name: 'System Reports', endpoint: '/api/reports', method: 'GET', privilege: 'VIEW_REPORTS' },
        { name: 'Database Management', endpoint: '/api/system/health', method: 'GET', privilege: 'DATABASE_MANAGEMENT' }
      ],
      dashboardFeatures: [
        'System-wide user management',
        'Role and privilege administration',
        'Financial overview and analytics',
        'System health monitoring',
        'Database management access',
        'Complete audit logs'
      ]
    });
  } catch (error) {
    logger.error('Error fetching admin dashboard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching admin dashboard',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Pharmacist Dashboard - Pharmaceutical operations (MANAGE_PRESCRIPTIONS privilege required)
router.get('/pharmacist', auth, requirePrivilege('MANAGE_PRESCRIPTIONS'), async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Prescription statistics (pharmacist privilege)
    const activePrescriptions = await Prescription.countDocuments({ status: 'active' });
    const completedToday = await Prescription.countDocuments({
      status: 'completed',
      updatedAt: { $gte: startOfToday }
    });
    const pendingPrescriptions = await Prescription.countDocuments({ status: 'pending' });

    // Inventory for prescriptions (pharmacist can see inventory)
    const criticalDrugs = await Inventory.find({
      $expr: { $lte: ['$quantity', '$reorderPoint'] }
    }).populate('drug', 'name genericName strength form')
    .limit(5);

    // Recent prescription activities
    const recentPrescriptions = await Prescription.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('diagnosis status patientName updatedAt')
      .populate('patient', 'fullName');

    // Drug interactions and safety
    const highRiskDrugs = await Drug.find({
      $or: [
        { 'interactions.severity': 'high' },
        { 'sideEffects.severity': 'severe' }
      ]
    }).limit(3);

    res.json({
      success: true,
      message: '💊 PHARMACIST DASHBOARD ACCESS GRANTED!',
      role: 'Pharmacist',
      requiredPrivilege: 'MANAGE_PRESCRIPTIONS',
      privileges: ['Prescription management', 'Inventory access', 'Sales operations', 'Patient safety', 'Drug interactions'],
      accessLevel: 'PHARMACEUTICAL_PROFESSIONAL',
      restrictions: 'Limited to pharmaceutical operations - No system administration access',
      statistics: {
        prescriptions: {
          active: activePrescriptions,
          completedToday,
          pending: pendingPrescriptions
        },
        inventory: {
          criticalDrugs: criticalDrugs.length,
          criticalDrugsList: criticalDrugs.map(item => ({
            name: (item.drug as any).name,
            generic: (item.drug as any).genericName,
            strength: (item.drug as any).strength,
            form: (item.drug as any).form,
            currentStock: item.quantity,
            reorderLevel: item.reorderPoint
          }))
        },
        safety: {
          highRiskDrugs: highRiskDrugs.length
        }
      },
      recentActivities: recentPrescriptions.map(prescription => ({
        action: `Prescription ${prescription.status}`,
        details: `${prescription.diagnosis} - ${(prescription.patient as any)?.fullName || 'Unknown'}`,
        time: getTimeAgo(prescription.updatedAt)
      })),
      quickActions: [
        { name: 'Manage Prescriptions', endpoint: '/api/prescriptions', method: 'GET', privilege: 'MANAGE_PRESCRIPTIONS' },
        { name: 'Check Inventory', endpoint: '/api/inventory', method: 'GET', privilege: 'VIEW_INVENTORY' },
        { name: 'Process Sales', endpoint: '/api/sales', method: 'POST', privilege: 'CREATE_SALES' },
        { name: 'Patient Safety Check', endpoint: '/api/drugs/interactions', method: 'GET', privilege: 'MANAGE_PRESCRIPTIONS' }
      ],
      dashboardFeatures: [
        'Prescription management and tracking',
        'Patient safety monitoring',
        'Drug interaction checking',
        'Inventory status for prescriptions',
        'Sales processing capabilities',
        'Clinical decision support'
      ],
      accessDenied: [
        'User management (requires VIEW_USERS)',
        'System settings (requires SYSTEM_SETTINGS)',
        'Role administration (requires SYSTEM_SETTINGS)',
        'Database management (requires DATABASE_MANAGEMENT)'
      ]
    });
  } catch (error) {
    logger.error('Error fetching pharmacist dashboard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching pharmacist dashboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Store Manager Dashboard - Business operations focus
router.get('/store-manager', auth, requirePrivilege('MANAGE_INVENTORY'), async (req, res) => {
  try {
    const today = new Date();
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Business metrics
    const monthlySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    const lastMonthSales = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    const currentMonthData = monthlySales.length > 0 ? monthlySales[0] : { total: 0, count: 0 };
    const lastMonthData = lastMonthSales.length > 0 ? lastMonthSales[0] : { total: 0, count: 0 };

    const salesGrowth = lastMonthData.total > 0 ? 
      Math.round(((currentMonthData.total - lastMonthData.total) / lastMonthData.total) * 100) : 0;

    // Staff performance
    const staffCount = await User.countDocuments({ isActive: true });
    const topPerformers = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfThisMonth } } },
      { $group: { _id: '$cashier', totalSales: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { totalSales: -1 } },
      { $limit: 3 }
    ]);

    // Inventory management
    const totalInventoryValue = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } } } }
    ]);
    const inventoryValue = totalInventoryValue.length > 0 ? totalInventoryValue[0].total : 0;

    res.json({
      success: true,
      message: '🏪 STORE MANAGER DASHBOARD ACCESS GRANTED!',
      role: 'Store Manager',
      requiredPrivilege: 'MANAGE_INVENTORY',
      privileges: ['Business oversight', 'Staff management', 'Inventory control', 'Performance monitoring', 'Sales analytics'],
      accessLevel: 'BUSINESS_MANAGER',
      restrictions: 'Limited to business operations - No system administration or user management access',
      statistics: {
        business: {
          monthlySales: `₵${currentMonthData.total.toLocaleString()}`,
          monthlySalesRaw: currentMonthData.total,
          salesCount: currentMonthData.count,
          salesGrowth: `${salesGrowth >= 0 ? '+' : ''}${salesGrowth}%`
        },
        staff: {
          totalStaff: staffCount,
          topPerformers: topPerformers.length
        },
        inventory: {
          totalValue: `₵${inventoryValue.toLocaleString()}`,
          totalValueRaw: inventoryValue
        }
      },
      quickActions: [
        { name: 'View Sales Reports', endpoint: '/api/reports/sales', method: 'GET', privilege: 'VIEW_REPORTS' },
        { name: 'Manage Staff', endpoint: '/api/users', method: 'GET', privilege: 'VIEW_USERS' },
        { name: 'Inventory Overview', endpoint: '/api/inventory', method: 'GET', privilege: 'VIEW_INVENTORY' },
        { name: 'Performance Analytics', endpoint: '/api/reports/performance', method: 'GET', privilege: 'GENERATE_REPORTS' }
      ],
      dashboardFeatures: [
        'Business performance monitoring',
        'Staff performance tracking',
        'Sales analytics and trends',
        'Inventory value management',
        'Financial reporting access',
        'Store operations oversight'
      ],
      accessDenied: [
        'System settings (requires SYSTEM_SETTINGS)',
        'Role administration (requires SYSTEM_SETTINGS)',
        'Database management (requires DATABASE_MANAGEMENT)',
        'Advanced user management (requires EDIT_USERS)'
      ]
    });
  } catch (error) {
    logger.error('Error fetching store manager dashboard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching store manager dashboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cashier Dashboard - Transaction focus
router.get('/cashier', auth, requirePrivilege('CREATE_SALES'), async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Today's transactions
    const todaySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    const todayData = todaySales.length > 0 ? todaySales[0] : { total: 0, count: 0 };

    // Popular items
    const popularItems = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: '$drug', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Recent transactions
    const recentTransactions = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('totalAmount paymentMethod createdAt')
      .populate('drug', 'name');

    res.json({
      success: true,
      message: '💰 CASHIER DASHBOARD ACCESS GRANTED!',
      role: 'Cashier',
      requiredPrivilege: 'CREATE_SALES',
      privileges: ['Process sales', 'View inventory', 'Customer service', 'Basic reporting', 'Transaction management'],
      accessLevel: 'FRONT_LINE_STAFF',
      restrictions: 'Limited to sales transactions - No management or administrative access',
      statistics: {
        today: {
          sales: `₵${todayData.total.toLocaleString()}`,
          transactions: todayData.count
        },
        popularItems: popularItems.length
      },
      recentActivities: recentTransactions.map(sale => ({
        action: 'Sale completed',
        details: `${(sale.drug as any)?.name || 'Unknown'} - ₵${sale.totalAmount.toFixed(2)}`,
        time: getTimeAgo(sale.createdAt)
      })),
      quickActions: [
        { name: 'New Sale', endpoint: '/api/sales', method: 'POST', privilege: 'CREATE_SALES' },
        { name: 'Check Inventory', endpoint: '/api/inventory', method: 'GET', privilege: 'VIEW_INVENTORY' },
        { name: 'View Prescriptions', endpoint: '/api/prescriptions', method: 'GET', privilege: 'VIEW_PRESCRIPTIONS' },
        { name: 'Daily Summary', endpoint: '/api/sales/daily-summary', method: 'GET', privilege: 'VIEW_REPORTS' }
      ],
      dashboardFeatures: [
        'Sales transaction processing',
        'Inventory checking for customers',
        'Prescription verification',
        'Daily sales summary',
        'Customer service tools',
        'Basic reporting access'
      ],
      accessDenied: [
        'User management (requires VIEW_USERS)',
        'System settings (requires SYSTEM_SETTINGS)',
        'Role administration (requires SYSTEM_SETTINGS)',
        'Advanced analytics (requires GENERATE_REPORTS)',
        'Database management (requires DATABASE_MANAGEMENT)'
      ]
    });
  } catch (error) {
    logger.error('Error fetching cashier dashboard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching cashier dashboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});



export default router;

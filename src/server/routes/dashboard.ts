import express from 'express';
import { Drug } from '../models/Drug';
import { Sale } from '../models/Sale';
import { Prescription } from '../models/Prescription';
import { User } from '../models/User';
import { Inventory } from '../models/Inventory';
import { auth } from '../middleware/auth';
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
router.get('/stats', auth, async (req, res) => {
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
router.get('/alerts', auth, async (req, res) => {
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
router.get('/recent-activities', auth, async (req, res) => {
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
      .select('fullName role createdAt');

    recentUsers.forEach(user => {
      const timeAgo = getTimeAgo(user.createdAt);
      activities.push({
        id: `user-${user._id}`,
        action: 'User registered',
        item: `${user.role}: ${user.fullName}`,
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

export default router;

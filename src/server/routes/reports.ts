import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Sale } from '../models/Sale';
import { Prescription } from '../models/Prescription';
import { Inventory } from '../models/Inventory';
// import { Drug } from '../models/Drug';
// import { User } from '../models/User';
import { logger } from '../config/logger';

const router = express.Router();

// Get sales analytics
router.get('/sales', auth, requireRole(['admin', 'manager']), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { startDate, endDate, storeId } = req.query;
  
  let dateFilter: any = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    };
  }
  
  if (storeId) dateFilter.store = storeId;
  
  const sales = await Sale.find(dateFilter)
    .populate('drug', 'name genericName brandName')
    .populate('store', 'name location')
    .populate('customer', 'name phone')
    .populate('cashier', 'name');
    
  // Calculate analytics
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageOrderValue = totalSales / sales.length || 0;
  
  // Top selling drugs
  const drugSales = sales.reduce((acc, sale) => {
    const drugName = (sale.drug as any).name;
    if (!acc[drugName]) {
      acc[drugName] = { quantity: 0, revenue: 0 };
    }
    acc[drugName].quantity += sale.quantity;
    acc[drugName].revenue += sale.totalAmount;
    return acc;
  }, {} as any);
  
  const topDrugs = Object.entries(drugSales)
    .map(([name, data]: [string, any]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
    
  res.json({
    success: true,
    data: {
      summary: {
        totalSales,
        totalQuantity,
        totalOrders: sales.length,
        averageOrderValue
      },
      topDrugs,
      sales: sales.slice(0, 100) // Limit for performance
    }
  });
}));

// Get inventory analytics
router.get('/inventory', auth, requireRole(['admin', 'manager']), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { storeId } = req.query;
  
  let query: any = {};
  if (storeId) query.store = storeId;
  
  const inventory = await Inventory.find(query)
    .populate('drug', 'name genericName brandName category')
    .populate('store', 'name location');
    
  // Calculate analytics
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0);
  const lowStock = inventory.filter(item => item.quantity < 10).length;
  const outOfStock = inventory.filter(item => item.quantity === 0).length;
  
  // Category breakdown
  const categoryBreakdown = inventory.reduce((acc, item) => {
    const category = (item.drug as any).category;
    if (!acc[category]) acc[category] = { count: 0, value: 0 };
    acc[category].count++;
    acc[category].value += item.quantity * item.sellingPrice;
    return acc;
  }, {} as any);
  
  // Expiring soon (within 30 days)
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringSoon = inventory.filter(item => 
    item.batches.some(batch => 
      new Date(batch.expiryDate) <= thirtyDaysFromNow && new Date(batch.expiryDate) > now
    )
  );
  
  res.json({
    success: true,
    data: {
      summary: {
        totalItems,
        totalValue,
        lowStock,
        outOfStock,
        expiringSoon: expiringSoon.length
      },
      categoryBreakdown,
      expiringSoon: expiringSoon.slice(0, 20)
    }
  });
}));

// Get prescription analytics
router.get('/prescriptions', auth, requireRole(['admin', 'manager']), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { startDate, endDate, storeId } = req.query;
  
  let dateFilter: any = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    };
  }
  
  if (storeId) dateFilter.store = storeId;
  
  const prescriptions = await Prescription.find(dateFilter)
    .populate('patient', 'name gender dateOfBirth')
    .populate('doctor', 'name specialization')
    .populate('drugs.drug', 'name category')
    .populate('store', 'name location');
    
  // Calculate analytics
  const totalPrescriptions = prescriptions.length;
  const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
  const expiredPrescriptions = prescriptions.filter(p => new Date(p.expiryDate) < new Date()).length;
  
  // Gender breakdown
  const genderBreakdown = prescriptions.reduce((acc, prescription) => {
    const gender = (prescription.patient as any).gender;
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as any);
  
  // Doctor breakdown
  const doctorBreakdown = prescriptions.reduce((acc, prescription) => {
    const doctorName = (prescription.doctor as any).name;
    acc[doctorName] = (acc[doctorName] || 0) + 1;
    return acc;
  }, {} as any);
  
  // Drug category breakdown
  const drugCategoryBreakdown = prescriptions.reduce((acc, prescription) => {
    prescription.drugs.forEach((drugItem: any) => {
      const category = drugItem.drug.category;
      acc[category] = (acc[category] || 0) + 1;
    });
    return acc;
  }, {} as any);
  
  res.json({
    success: true,
    data: {
      summary: {
        totalPrescriptions,
        activePrescriptions,
        expiredPrescriptions
      },
      genderBreakdown,
      doctorBreakdown,
      drugCategoryBreakdown
    }
  });
}));

// Generate comprehensive report
router.post('/generate', auth, requireRole(['admin', 'manager']), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { reportType, startDate, endDate, storeId, format = 'json' } = req.body;
  
  let dateFilter: any = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  }
  
  if (storeId) dateFilter.store = storeId;
  
  let reportData: any = {};
  
  switch (reportType) {
    case 'sales':
      const sales = await Sale.find(dateFilter)
        .populate('drug', 'name genericName brandName category')
        .populate('store', 'name location')
        .populate('customer', 'name phone')
        .populate('cashier', 'name');
        
      reportData = {
        type: 'Sales Report',
        period: `${startDate} to ${endDate}`,
        totalSales: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        totalOrders: sales.length,
        sales: sales
      };
      break;
      
    case 'inventory':
      const inventory = await Inventory.find(storeId ? { store: storeId } : {})
        .populate('drug', 'name genericName brandName category')
        .populate('store', 'name location');
        
      reportData = {
        type: 'Inventory Report',
        period: 'Current',
        totalItems: inventory.length,
        totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0),
        inventory: inventory
      };
      break;
      
    case 'prescriptions':
      const prescriptions = await Prescription.find(dateFilter)
        .populate('patient', 'name phone email dateOfBirth gender')
        .populate('doctor', 'name phone email specialization')
        .populate('drugs.drug', 'name genericName brandName')
        .populate('store', 'name location');
        
      reportData = {
        type: 'Prescriptions Report',
        period: `${startDate} to ${endDate}`,
        totalPrescriptions: prescriptions.length,
        prescriptions: prescriptions
      };
      break;
      
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
  }
  
  if (format === 'csv') {
    // Convert to CSV format
    const csvData = convertToCSV(reportData);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.csv"`);
    return res.send(csvData);
  }
  
  res.json({
    success: true,
    data: reportData
  });
}));

// Schedule report generation
router.post('/schedule', auth, requireRole(['admin', 'manager']), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { reportType, frequency, recipients, storeId } = req.body;
  
  // This would typically integrate with a job scheduler like cron or Bull
  // For now, we'll just log the request
  logger.info(`Report scheduling requested: ${reportType} - ${frequency} for store: ${storeId}`);
  
  res.json({
    success: true,
    message: 'Report scheduling request received',
    data: {
      reportType,
      frequency,
      recipients,
      storeId,
      scheduledAt: new Date()
    }
  });
}));

// Helper function to convert data to CSV
function convertToCSV(data: any): string {
  if (!data || typeof data !== 'object') return '';
  
  const flattenObject = (obj: any, prefix = ''): any => {
    return Object.keys(obj).reduce((acc: any, key) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], pre + key));
      } else {
        acc[pre + key] = obj[key];
      }
      return acc;
    }, {});
  };
  
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    const flattened = data.map(item => flattenObject(item));
    const headers = Object.keys(flattened[0]);
    const csv = [headers.join(',')];
    
    flattened.forEach(row => {
      csv.push(headers.map(header => `"${row[header] || ''}"`).join(','));
    });
    
    return csv.join('\n');
  }
  
  return '';
}

export default router;

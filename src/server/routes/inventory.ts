import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Drug } from '../models/Drug';
import { Inventory } from '../models/Inventory';
import { logger } from '../config/logger';

const router = express.Router();

// Get all inventory items with pagination and filtering
router.get('/', auth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { page = 1, limit = 10, search, category, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  
  let query: any = {};
  
  if (search) {
    query.$or = [
      { 'drug.name': { $regex: search, $options: 'i' } },
      { 'drug.genericName': { $regex: search, $options: 'i' } },
      { 'drug.brandName': { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category) query['drug.category'] = category;
  if (status) query.status = status;
  
  const inventory = await Inventory.find(query)
    .populate('drug', 'name genericName brandName category strength form')
    .populate('store', 'name location')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(Number(limit));
    
  const total = await Inventory.countDocuments(query);
  
  res.json({
    success: true,
    data: inventory,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get single inventory item
router.get('/:id', auth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const inventory = await Inventory.findById(req.params.id)
    .populate('drug', 'name genericName brandName category strength form manufacturer')
    .populate('store', 'name location');
    
  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }
  
  res.json({
    success: true,
    data: inventory
  });
}));

// Add new inventory item
router.post('/', auth, requireRole(['admin', 'manager', 'pharmacist']), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { drugId, storeId, quantity, batchNumber, expiryDate, purchasePrice, sellingPrice, supplier } = req.body;
  
  // Check if drug exists
  const drug = await Drug.findById(drugId);
  if (!drug) {
    return res.status(404).json({
      success: false,
      message: 'Drug not found'
    });
  }
  
  // Check if inventory item already exists for this drug and store
  let inventory = await Inventory.findOne({ drug: drugId, store: storeId });
  
  if (inventory) {
    // Update existing inventory
    inventory.quantity += Number(quantity);
    inventory.batches.push({
      batchNumber,
      quantity: Number(quantity),
      expiryDate: new Date(expiryDate),
      purchasePrice: Number(purchasePrice),
      supplier,
      receivedDate: new Date()
    });
    inventory.sellingPrice = Number(sellingPrice);
    inventory.updatedAt = new Date();
  } else {
    // Create new inventory item
    inventory = new Inventory({
      drug: drugId,
      store: storeId,
      quantity: Number(quantity),
      batches: [{
        batchNumber,
        quantity: Number(quantity),
        expiryDate: new Date(expiryDate),
        purchasePrice: Number(purchasePrice),
        supplier,
        receivedDate: new Date()
      }],
      sellingPrice: Number(sellingPrice),
      status: 'active'
    });
  }
  
  await inventory.save();
  
  // Populate drug and store info
  await inventory.populate('drug', 'name genericName brandName');
  await inventory.populate('store', 'name location');
  
  logger.info(`Inventory updated for drug: ${drug.name} in store: ${(inventory.store as any).name}`);
  
  res.status(201).json({
    success: true,
    message: 'Inventory updated successfully',
    data: inventory
  });
}));

// Update inventory item
router.put('/:id', auth, requireRole(['admin', 'manager', 'pharmacist']), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { quantity, sellingPrice, status, notes } = req.body;
  
  const inventory = await Inventory.findById(req.params.id);
  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }
  
  if (quantity !== undefined) inventory.quantity = Number(quantity);
  if (sellingPrice !== undefined) inventory.sellingPrice = Number(sellingPrice);
  if (status !== undefined) inventory.status = status;
  if (notes !== undefined) inventory.notes = notes;
  
  inventory.updatedAt = new Date();
  await inventory.save();
  
  await inventory.populate('drug', 'name genericName brandName');
  await inventory.populate('store', 'name location');
  
  res.json({
    success: true,
    message: 'Inventory updated successfully',
    data: inventory
  });
}));

// Delete inventory item
router.delete('/:id', auth, requireRole(['admin', 'manager']), asyncHandler(async (req: express.Request, res: express.Response) => {
  const inventory = await Inventory.findById(req.params.id);
  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }
  
  await Inventory.findByIdAndDelete(req.params.id);
  
  logger.info(`Inventory deleted for drug: ${inventory.drug} in store: ${inventory.store}`);
  
  res.json({
    success: true,
    message: 'Inventory deleted successfully'
  });
}));

// Export inventory to CSV
router.get('/export/csv', auth, requireRole(['admin', 'manager']), asyncHandler(async (_req: express.Request, res: express.Response) => {
  const inventory = await Inventory.find()
    .populate('drug', 'name genericName brandName category strength form')
    .populate('store', 'name location');
    
  const csvData = inventory.map(item => ({
    'Drug Name': (item.drug as any).name,
    'Generic Name': (item.drug as any).genericName,
    'Brand Name': (item.drug as any).brandName,
    'Category': (item.drug as any).category,
    'Strength': (item.drug as any).strength,
    'Form': (item.drug as any).form,
    'Store': (item.store as any).name,
    'Location': (item.store as any).location,
    'Quantity': item.quantity,
    'Selling Price': item.sellingPrice,
    'Status': item.status,
    'Last Updated': item.updatedAt
  }));
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory-export.csv"');
  
  const csv = csvData.map(row => 
    Object.values(row).map(value => `"${value}"`).join(',')
  ).join('\n');
  
  res.send(csv);
}));

export default router;

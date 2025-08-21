import express from 'express';
import mongoose from 'mongoose';
import { auth, requirePrivilege, requireCategoryPrivilege } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Sale } from '../models/Sale';
import { Drug } from '../models/Drug';
import { Inventory } from '../models/Inventory';
// import { User } from '../models/User';
import { logger } from '../config/logger';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Get all sales with pagination and filtering
router.get('/', auth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { page = 1, limit = 10, search, startDate, endDate, storeId, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  
  let query: any = {};
  
  if (search) {
    query.$or = [
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'customer.phone': { $regex: search, $options: 'i' } },
      { 'drug.name': { $regex: search, $options: 'i' } }
    ];
  }
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }
  
  if (storeId) query.store = storeId;
  if (status) query.status = status;
  
  const sales = await Sale.find(query)
    .populate('drug', 'name genericName brandName strength form')
    .populate('store', 'name location')
    .populate('customer', 'name phone email')
    .populate('cashier', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
    
  const total = await Sale.countDocuments(query);
  
  res.json({
    success: true,
    data: sales,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get single sale
router.get('/:id', auth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const sale = await Sale.findById(req.params.id)
    .populate('drug', 'name genericName brandName strength form manufacturer')
    .populate('store', 'name location address phone')
    .populate('customer', 'name phone email address')
    .populate('cashier', 'name');
    
  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Sale not found'
    });
  }
  
  res.json({
    success: true,
    data: sale
  });
}));

// Create new sale
router.post('/', auth, requirePrivilege('CREATE_SALES'), asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    drugId,
    storeId,
    customerId,
    quantity,
    unitPrice,
    discount,
    paymentMethod,
    customerNotes
  } = req.body;
  
  // Validate drug exists and has sufficient inventory
  const drug = await Drug.findById(drugId);
  if (!drug) {
    return res.status(404).json({
      success: false,
      message: 'Drug not found'
    });
  }
  
  // Check inventory
  const inventory = await Inventory.findOne({ drug: drugId, store: storeId });
  if (!inventory || inventory.quantity < quantity) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient inventory'
    });
  }
  
  // Calculate totals
  const subtotal = quantity * unitPrice;
  const discountAmount = (discount || 0) * subtotal / 100;
  const totalAmount = subtotal - discountAmount;
  
  // Create sale record
  const sale = new Sale({
    drug: drugId,
    store: storeId,
    customer: customerId,
    cashier: req.user?.userId,
    quantity,
    unitPrice,
    subtotal,
    discount: discount || 0,
    discountAmount,
    totalAmount,
    paymentMethod: paymentMethod || 'cash',
    customerNotes,
    status: 'completed'
  });
  
  await sale.save();
  
  // Update inventory
  inventory.quantity -= quantity;
  inventory.updatedAt = new Date();
  await inventory.save();
  
  // Populate related data
  await sale.populate('drug', 'name genericName brandName');
  await sale.populate('store', 'name location');
  await sale.populate('customer', 'name phone email');
  await sale.populate('cashier', 'name');
  
  logger.info(`New sale created: ${drug.name} x${quantity} for ${(sale.customer as any).name}`);
  
  res.status(201).json({
    success: true,
    message: 'Sale completed successfully',
    data: sale
  });
}));

// Update sale
router.put('/:id', auth, requirePrivilege('MANAGE_SALES'), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { status, customerNotes, refundReason } = req.body;
  
  const sale = await Sale.findById(req.params.id);
  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Sale not found'
    });
  }
  
  if (status) sale.status = status;
  if (customerNotes) sale.customerNotes = customerNotes;
  if (refundReason) sale.refundReason = refundReason;
  
  sale.updatedAt = new Date();
  if (req.user?.userId) {
    sale.updatedBy = new mongoose.Types.ObjectId(req.user.userId);
  }
  
  await sale.save();
  
  await sale.populate('drug', 'name genericName brandName');
  await sale.populate('store', 'name location');
  await sale.populate('customer', 'name phone email');
  await sale.populate('cashier', 'name');
  
  res.json({
    success: true,
    message: 'Sale updated successfully',
    data: sale
  });
}));

// Delete sale (soft delete)
router.delete('/:id', auth, requirePrivilege('MANAGE_SALES'), asyncHandler(async (req: express.Request, res: express.Response) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Sale not found'
    });
  }
  
  // Store original status before changing
  const originalStatus = sale.status;
  
  // Soft delete by updating status
  sale.status = 'cancelled';
  sale.updatedAt = new Date();
  if (req.user?.userId) {
    sale.updatedBy = new mongoose.Types.ObjectId(req.user.userId);
  }
  await sale.save();
  
  // Restore inventory if sale was completed
  if (originalStatus === 'completed') {
    const inventory = await Inventory.findOne({ drug: sale.drug, store: sale.store });
    if (inventory) {
      inventory.quantity += sale.quantity;
      inventory.updatedAt = new Date();
      await inventory.save();
    }
  }
  
  logger.info(`Sale cancelled: ${sale.drug} x${sale.quantity} for ${sale.customer}`);
  
  res.json({
    success: true,
    message: 'Sale cancelled successfully'
  });
}));

// Generate PDF receipt
router.get('/:id/receipt', auth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const sale = await Sale.findById(req.params.id)
    .populate('drug', 'name genericName brandName strength form')
    .populate('store', 'name location address phone')
    .populate('customer', 'name phone email address')
    .populate('cashier', 'name');
    
  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Sale not found'
    });
  }
  
  // Create PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt-${sale._id}.pdf"`);
  
  // Pipe PDF to response
  doc.pipe(res);
  
  // Add content to PDF
  doc.fontSize(24).text('PHARMACY RECEIPT', { align: 'center' });
  doc.moveDown();
  
  // Store information
  doc.fontSize(14).text((sale.store as any).name);
  doc.fontSize(10).text((sale.store as any).address);
  doc.fontSize(10).text(`Phone: ${(sale.store as any).phone}`);
  doc.moveDown();
  
  // Receipt details
  doc.fontSize(12).text(`Receipt #: ${sale._id}`);
  doc.fontSize(10).text(`Date: ${sale.createdAt.toLocaleDateString()}`);
  doc.fontSize(10).text(`Time: ${sale.createdAt.toLocaleTimeString()}`);
  doc.fontSize(10).text(`Cashier: ${(sale.cashier as any).name}`);
  doc.moveDown();
  
  // Customer information
  doc.fontSize(12).text('Customer Information:');
  doc.fontSize(10).text(`Name: ${(sale.customer as any).name}`);
  doc.fontSize(10).text(`Phone: ${(sale.customer as any).phone}`);
  if ((sale.customer as any).email) {
    doc.fontSize(10).text(`Email: ${(sale.customer as any).email}`);
  }
  doc.moveDown();
  
  // Drug details
  doc.fontSize(12).text('Drug Details:');
  doc.fontSize(10).text(`Name: ${(sale.drug as any).name}`);
  doc.fontSize(10).text(`Generic: ${(sale.drug as any).genericName}`);
  doc.fontSize(10).text(`Brand: ${(sale.drug as any).brandName}`);
  doc.fontSize(10).text(`Strength: ${(sale.drug as any).strength}`);
  doc.fontSize(10).text(`Form: ${(sale.drug as any).form}`);
  doc.moveDown();
  
  // Sale details
  doc.fontSize(12).text('Sale Details:');
  doc.fontSize(10).text(`Quantity: ${sale.quantity}`);
  doc.fontSize(10).text(`Unit Price: $${sale.unitPrice.toFixed(2)}`);
  doc.fontSize(10).text(`Subtotal: $${sale.subtotal.toFixed(2)}`);
  if (sale.discount > 0) {
    doc.fontSize(10).text(`Discount: ${sale.discount}% (-$${sale.discountAmount.toFixed(2)})`);
  }
  doc.fontSize(12).text(`Total: $${sale.totalAmount.toFixed(2)}`, { align: 'right' });
  doc.moveDown();
  
  // Payment method
  doc.fontSize(10).text(`Payment Method: ${sale.paymentMethod.toUpperCase()}`);
  doc.moveDown();
  
  // Notes
  if (sale.customerNotes) {
    doc.fontSize(10).text(`Notes: ${sale.customerNotes}`);
    doc.moveDown();
  }
  
  // Footer
  doc.fontSize(8).text('Thank you for your purchase!', { align: 'center' });
  doc.fontSize(8).text('Please keep this receipt for your records.', { align: 'center' });
  
  // Finalize PDF
  doc.end();
}));

// Export sales to CSV
router.get('/export/csv', auth, requirePrivilege('GENERATE_REPORTS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { startDate, endDate, storeId } = req.query;
  
  let query: any = {};
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }
  if (storeId) query.store = storeId;
  
  const sales = await Sale.find(query)
    .populate('drug', 'name genericName brandName')
    .populate('store', 'name location')
    .populate('customer', 'name phone email')
    .populate('cashier', 'name');
    
  const csvData = sales.map(sale => ({
    'Sale ID': sale._id,
    'Date': sale.createdAt,
    'Drug Name': (sale.drug as any).name,
    'Generic Name': (sale.drug as any).genericName,
    'Brand Name': (sale.drug as any).brandName,
    'Store': (sale.store as any).name,
    'Customer Name': (sale.customer as any).name,
    'Customer Phone': (sale.customer as any).phone,
    'Quantity': sale.quantity,
    'Unit Price': sale.unitPrice,
    'Subtotal': sale.subtotal,
    'Discount': sale.discount,
    'Total Amount': sale.totalAmount,
    'Payment Method': sale.paymentMethod,
    'Status': sale.status,
    'Cashier': (sale.cashier as any).name
  }));
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sales-export.csv"');
  
  const csv = csvData.map(row => 
    Object.values(row).map(value => `"${value}"`).join(',')
  ).join('\n');
  
  res.send(csv);
}));

export default router;

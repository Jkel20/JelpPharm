import express from 'express';
import mongoose from 'mongoose';
import { auth, requirePrivilege, requireCategoryPrivilege } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Prescription } from '../models/Prescription';
import { Patient } from '../models/Patient';
import { Drug } from '../models/Drug';
import { logger } from '../config/logger';

const router = express.Router();

// Get all prescriptions with pagination and filtering
router.get('/', auth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { page = 1, limit = 10, search, status, patientId, doctorId } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  
  let query: any = {};
  
  if (search) {
    query.$or = [
      { 'patient.name': { $regex: search, $options: 'i' } },
      { 'patient.phone': { $regex: search, $options: 'i' } },
      { 'doctor.name': { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status) query.status = status;
  if (patientId) query.patient = patientId;
  if (doctorId) query.doctor = doctorId;
  
  const prescriptions = await Prescription.find(query)
    .populate('patient', 'name phone email dateOfBirth gender')
    .populate('doctor', 'name phone email specialization')
    .populate('drugs.drug', 'name genericName brandName strength form')
    .populate('store', 'name location')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
    
  const total = await Prescription.countDocuments(query);
  
  res.json({
    success: true,
    data: prescriptions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get single prescription
router.get('/:id', auth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'name phone email dateOfBirth gender address')
    .populate('doctor', 'name phone email specialization licenseNumber')
    .populate('drugs.drug', 'name genericName brandName strength form manufacturer')
    .populate('store', 'name location');
    
  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }
  
  res.json({
    success: true,
    data: prescription
  });
}));

// Create new prescription
router.post('/', auth, requirePrivilege('MANAGE_PRESCRIPTIONS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    patientId,
    doctorId,
    storeId,
    drugs,
    diagnosis,
    instructions,
    prescribedDate,
    expiryDate,
    refills,
    notes
  } = req.body;
  
  // Validate patient exists
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }
  
  // Validate drugs exist
  for (const drugItem of drugs) {
    const drug = await Drug.findById(drugItem.drugId);
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: `Drug with ID ${drugItem.drugId} not found`
      });
    }
  }
  
  const prescription = new Prescription({
    patient: patientId,
    doctor: doctorId,
    store: storeId,
    drugs: drugs.map((drugItem: any) => ({
      drug: drugItem.drugId,
      dosage: drugItem.dosage,
      frequency: drugItem.frequency,
      duration: drugItem.duration,
      quantity: drugItem.quantity,
      instructions: drugItem.instructions
    })),
    diagnosis,
    instructions,
    prescribedDate: new Date(prescribedDate),
    expiryDate: new Date(expiryDate),
    refills: Number(refills) || 0,
    notes,
    status: 'active',
    createdBy: req.user?.userId
  });
  
  await prescription.save();
  
  // Populate related data
  await prescription.populate('patient', 'name phone email');
  await prescription.populate('doctor', 'name phone email');
  await prescription.populate('drugs.drug', 'name genericName brandName');
  await prescription.populate('store', 'name location');
  
  logger.info(`New prescription created for patient: ${patient.name} by doctor: ${(prescription.doctor as any).name}`);
  
  res.status(201).json({
    success: true,
    message: 'Prescription created successfully',
    data: prescription
  });
}));

// Update prescription
router.put('/:id', auth, requirePrivilege('MANAGE_PRESCRIPTIONS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    drugs,
    diagnosis,
    instructions,
    expiryDate,
    refills,
    status,
    notes
  } = req.body;
  
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }
  
  if (drugs) prescription.drugs = drugs;
  if (diagnosis) prescription.diagnosis = diagnosis;
  if (instructions) prescription.instructions = instructions;
  if (expiryDate) prescription.expiryDate = new Date(expiryDate);
  if (refills !== undefined) prescription.refills = Number(refills);
  if (status) prescription.status = status;
  if (notes) prescription.notes = notes;
  
  prescription.updatedAt = new Date();
  if (req.user?.userId) {
    prescription.updatedBy = new mongoose.Types.ObjectId(req.user.userId);
  }
  
  await prescription.save();
  
  await prescription.populate('patient', 'name phone email');
  await prescription.populate('doctor', 'name phone email');
  await prescription.populate('drugs.drug', 'name genericName brandName');
  await prescription.populate('store', 'name location');
  
  res.json({
    success: true,
    message: 'Prescription updated successfully',
    data: prescription
  });
}));

// Delete prescription
router.delete('/:id', auth, requirePrivilege('MANAGE_PRESCRIPTIONS'), asyncHandler(async (req: express.Request, res: express.Response) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }
  
  await Prescription.findByIdAndDelete(req.params.id);
  
  logger.info(`Prescription deleted for patient: ${prescription.patient}`);
  
  res.json({
    success: true,
    message: 'Prescription deleted successfully'
  });
}));

// Export prescriptions to CSV
router.get('/export/csv', auth, requirePrivilege('GENERATE_REPORTS'), asyncHandler(async (_req: express.Request, res: express.Response) => {
  const prescriptions = await Prescription.find()
    .populate('patient', 'name phone email dateOfBirth gender')
    .populate('doctor', 'name phone email specialization')
    .populate('drugs.drug', 'name genericName brandName strength form')
    .populate('store', 'name location');
    
  const csvData = prescriptions.map(prescription => ({
    'Patient Name': (prescription.patient as any).name,
    'Patient Phone': (prescription.patient as any).phone,
    'Patient Email': (prescription.patient as any).email,
    'Doctor Name': (prescription.doctor as any).name,
    'Doctor Phone': (prescription.doctor as any).phone,
    'Store': (prescription.store as any).name,
    'Diagnosis': prescription.diagnosis,
    'Drugs': prescription.drugs.map(d => (d.drug as any).name).join('; '),
    'Status': prescription.status,
    'Prescribed Date': prescription.prescribedDate,
    'Expiry Date': prescription.expiryDate,
    'Refills': prescription.refills,
    'Created At': prescription.createdAt
  }));
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="prescriptions-export.csv"');
  
  const csv = csvData.map(row => 
    Object.values(row).map(value => `"${value}"`).join(',')
  ).join('\n');
  
  res.send(csv);
}));

export default router;

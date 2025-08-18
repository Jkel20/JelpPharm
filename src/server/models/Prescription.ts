import mongoose, { Document, Schema } from 'mongoose';

export interface IDrugItem {
  drug: mongoose.Types.ObjectId;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
}

export interface IPrescription extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  drugs: IDrugItem[];
  diagnosis: string;
  instructions: string;
  prescribedDate: Date;
  expiryDate: Date;
  refills: number;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry: number;
  totalDrugs: number;
}

const drugItemSchema = new Schema<IDrugItem>({
  drug: {
    type: Schema.Types.ObjectId,
    ref: 'Drug',
    required: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  instructions: {
    type: String,
    trim: true
  }
});

const prescriptionSchema = new Schema<IPrescription>({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  drugs: [drugItemSchema],
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    required: true,
    trim: true
  },
  prescribedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  refills: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'cancelled'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
prescriptionSchema.index({ patient: 1, status: 1 });
prescriptionSchema.index({ doctor: 1, status: 1 });
prescriptionSchema.index({ store: 1, status: 1 });
prescriptionSchema.index({ expiryDate: 1 });
prescriptionSchema.index({ createdAt: 1 });

// Virtual for checking if prescription is expired
prescriptionSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

// Virtual for checking if prescription is expiring soon (within 7 days)
prescriptionSchema.virtual('isExpiringSoon').get(function() {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  return this.expiryDate <= sevenDaysFromNow && this.expiryDate > new Date();
});

// Virtual for days until expiry
prescriptionSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const diffTime = this.expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for total drug count
prescriptionSchema.virtual('totalDrugs').get(function() {
  return this.drugs.length;
});

// Pre-save middleware to validate expiry date
prescriptionSchema.pre('save', function(next) {
  if (this.expiryDate <= this.prescribedDate) {
    return next(new Error('Expiry date must be after prescribed date'));
  }
  next();
});

// Pre-save middleware to update status based on expiry
prescriptionSchema.pre('save', function(next) {
  if (this.isExpired && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Static method to find active prescriptions
prescriptionSchema.statics.findActive = function(patientId?: mongoose.Types.ObjectId) {
  const query: any = { status: 'active' };
  if (patientId) query.patient = patientId;
  return this.find(query).populate('patient drugs.drug doctor store');
};

// Static method to find expiring prescriptions
prescriptionSchema.statics.findExpiringSoon = function(days: number = 7) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  
  return this.find({
    status: 'active',
    expiryDate: {
      $gte: new Date(),
      $lte: targetDate
    }
  }).populate('patient drugs.drug doctor store');
};

// Static method to find expired prescriptions
prescriptionSchema.statics.findExpired = function() {
  return this.find({
    status: 'active',
    expiryDate: { $lt: new Date() }
  }).populate('patient drugs.drug doctor store');
};

// Instance method to refill prescription
prescriptionSchema.methods.refill = function() {
  if (this.refills > 0) {
    this.refills -= 1;
    if (this.refills === 0) {
      this.status = 'completed';
    }
    return this.save();
  }
  throw new Error('No refills remaining');
};

// Instance method to cancel prescription
prescriptionSchema.methods.cancel = function(reason?: string) {
  this.status = 'cancelled';
  if (reason) this.notes = (this.notes || '') + `\nCancelled: ${reason}`;
  return this.save();
};

export const Prescription = mongoose.model<IPrescription>('Prescription', prescriptionSchema);

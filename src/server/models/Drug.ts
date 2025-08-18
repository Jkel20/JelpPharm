import mongoose, { Document, Schema } from 'mongoose';

export interface IDrug extends Document {
  name: string;
  genericName: string;
  brandName?: string;
  manufacturer: string;
  category: string;
  dosageForm: string;
  strength: string;
  activeIngredients: string[];
  description?: string;
  indications?: string;
  contraindications?: string;
  sideEffects?: string;
  storageConditions: string;
  prescriptionRequired: boolean;
  isControlled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const drugSchema = new Schema<IDrug>({
  name: {
    type: String,
    required: [true, 'Drug name is required'],
    trim: true,
    maxlength: [200, 'Drug name cannot exceed 200 characters']
  },
  genericName: {
    type: String,
    required: [true, 'Generic name is required'],
    trim: true,
    maxlength: [200, 'Generic name cannot exceed 200 characters']
  },
  brandName: {
    type: String,
    trim: true,
    maxlength: [200, 'Brand name cannot exceed 200 characters']
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true,
    maxlength: [200, 'Manufacturer cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  dosageForm: {
    type: String,
    required: [true, 'Dosage form is required'],
    trim: true,
    maxlength: [100, 'Dosage form cannot exceed 100 characters']
  },
  strength: {
    type: String,
    required: [true, 'Strength is required'],
    trim: true,
    maxlength: [100, 'Strength cannot exceed 100 characters']
  },
  activeIngredients: [{
    type: String,
    required: [true, 'At least one active ingredient is required'],
    trim: true,
    maxlength: [100, 'Active ingredient cannot exceed 100 characters']
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  indications: {
    type: String,
    trim: true,
    maxlength: [1000, 'Indications cannot exceed 1000 characters']
  },
  contraindications: {
    type: String,
    trim: true,
    maxlength: [1000, 'Contraindications cannot exceed 1000 characters']
  },
  sideEffects: {
    type: String,
    trim: true,
    maxlength: [1000, 'Side effects cannot exceed 1000 characters']
  },
  storageConditions: {
    type: String,
    required: [true, 'Storage conditions are required'],
    trim: true,
    maxlength: [500, 'Storage conditions cannot exceed 500 characters']
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  isControlled: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
drugSchema.index({ name: 'text', genericName: 'text', manufacturer: 'text' });
drugSchema.index({ name: 1 });
drugSchema.index({ genericName: 1 });
drugSchema.index({ manufacturer: 1 });
drugSchema.index({ category: 1 });
drugSchema.index({ dosageForm: 1 });
drugSchema.index({ prescriptionRequired: 1 });
drugSchema.index({ isControlled: 1 });
drugSchema.index({ isActive: 1 });

// Virtual for full drug name
drugSchema.virtual('fullDrugName').get(function(this: IDrug) {
  if (this.brandName && this.brandName !== this.name) {
    return `${this.name} (${this.brandName}) - ${this.strength} ${this.dosageForm}`;
  }
  return `${this.name} - ${this.strength} ${this.dosageForm}`;
});

// Virtual for searchable text
drugSchema.virtual('searchText').get(function(this: IDrug) {
  return `${this.name} ${this.genericName} ${this.brandName || ''} ${this.manufacturer} ${this.category} ${this.dosageForm} ${this.strength}`.toLowerCase();
});

// Pre-save middleware to ensure at least one active ingredient
drugSchema.pre('save', function(next) {
  if (!this.activeIngredients || this.activeIngredients.length === 0) {
    return next(new Error('At least one active ingredient is required'));
  }
  next();
});

// Pre-save middleware to validate controlled substance requirements
drugSchema.pre('save', function(next) {
  if (this.isControlled && !this.prescriptionRequired) {
    return next(new Error('Controlled substances must require a prescription'));
  }
  next();
});

export const Drug = mongoose.model<IDrug>('Drug', drugSchema);

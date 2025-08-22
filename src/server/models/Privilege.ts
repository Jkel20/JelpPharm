import mongoose, { Document, Schema } from 'mongoose';

export interface IPrivilege extends Document {
  name: string;
  description: string;
  code: string;
  category: 'user_management' | 'inventory' | 'sales' | 'prescriptions' | 'reports' | 'system' | 'store_management' | 'drug_management';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const privilegeSchema = new Schema<IPrivilege>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Privilege name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z_]+$/, 'Privilege code can only contain uppercase letters and underscores']
  },
  category: {
    type: String,
    required: true,
    enum: {
      values: ['user_management', 'inventory', 'sales', 'prescriptions', 'reports', 'system', 'store_management', 'drug_management'],
      message: 'Invalid privilege category'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
privilegeSchema.index({ code: 1 });
privilegeSchema.index({ category: 1 });
privilegeSchema.index({ isActive: 1 });

// Static method to find active privileges by category
privilegeSchema.statics.findActiveByCategory = function(category: string) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Static method to find all active privileges
privilegeSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ category: 1, name: 1 });
};

export const Privilege = mongoose.model<IPrivilege>('Privilege', privilegeSchema);

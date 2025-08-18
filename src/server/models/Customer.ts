import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  isActive: boolean;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  zipCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Zip code cannot exceed 20 characters']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [50, 'Country cannot exceed 50 characters'],
    default: 'Ghana'
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
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
customerSchema.index({ phone: 1 }, { unique: true });
customerSchema.index({ email: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ isActive: 1 });
customerSchema.index({ createdBy: 1 });

// Virtual for age calculation
customerSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  const parts = [this.address, this.city, this.state, this.zipCode, this.country];
  return parts.filter(part => part).join(', ');
});

// Pre-save middleware to validate date of birth if provided
customerSchema.pre('save', function(next) {
  if (this.dateOfBirth && this.dateOfBirth >= new Date()) {
    return next(new Error('Date of birth cannot be in the future'));
  }
  next();
});

// Pre-save middleware to validate phone number format
customerSchema.pre('save', function(next) {
  // Basic Ghana phone number validation
  const phoneRegex = /^(\+233|0)[0-9]{9}$/;
  if (!phoneRegex.test(this.phone)) {
    return next(new Error('Please enter a valid Ghana phone number'));
  }
  next();
});

// Static method to find active customers
customerSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to search customers
customerSchema.statics.search = function(query: string) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).sort({ name: 1 });
};

// Instance method to deactivate customer
customerSchema.methods.deactivate = function(reason?: string, updatedBy?: mongoose.Types.ObjectId) {
  this.isActive = false;
  if (reason) this.notes = (this.notes || '') + `\nDeactivated: ${reason}`;
  if (updatedBy) this.updatedBy = updatedBy;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to reactivate customer
customerSchema.methods.reactivate = function(updatedBy?: mongoose.Types.ObjectId) {
  this.isActive = true;
  if (updatedBy) this.updatedBy = updatedBy;
  this.updatedAt = new Date();
  return this.save();
};

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);

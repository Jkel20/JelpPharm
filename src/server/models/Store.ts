import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  name: string;
  location: string;
  address: string;
    city: string;
  state: string;
  zipCode: string;
    country: string;
    phone: string;
  email?: string;
  manager: mongoose.Types.ObjectId;
  isActive: boolean;
  openingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  services: string[];
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const openingHoursSchema = new Schema({
  open: {
    type: String,
    required: true,
    default: '08:00'
  },
  close: {
    type: String,
    required: true,
    default: '18:00'
  }
});

const storeSchema = new Schema<IStore>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  address: {
      type: String,
    required: true,
      trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
    },
    city: {
      type: String,
    required: true,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
  state: {
      type: String,
    required: true,
      trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
    },
  zipCode: {
      type: String,
    required: true,
      trim: true,
    maxlength: [20, 'Zip code cannot exceed 20 characters']
    },
    country: {
      type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Country cannot exceed 50 characters'],
    default: 'Ghana'
  },
    phone: {
      type: String,
    required: true,
    trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  openingHours: {
    monday: { type: openingHoursSchema, default: () => ({}) },
    tuesday: { type: openingHoursSchema, default: () => ({}) },
    wednesday: { type: openingHoursSchema, default: () => ({}) },
    thursday: { type: openingHoursSchema, default: () => ({}) },
    friday: { type: openingHoursSchema, default: () => ({}) },
    saturday: { type: openingHoursSchema, default: () => ({}) },
    sunday: { type: openingHoursSchema, default: () => ({}) }
  },
  services: [{
    type: String,
    trim: true,
    enum: [
      'prescription_dispensing',
      'over_the_counter',
      'vaccinations',
      'health_consultations',
      'laboratory_services',
      'medical_supplies',
      'home_delivery',
      'emergency_services'
    ]
  }],
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
storeSchema.index({ name: 1 });
storeSchema.index({ location: 1 });
storeSchema.index({ city: 1, state: 1 });
storeSchema.index({ isActive: 1 });
storeSchema.index({ manager: 1 });

// Virtual for full address
storeSchema.virtual('fullAddress').get(function() {
  const parts = [this.address, this.city, this.state, this.zipCode, this.country];
  return parts.filter(part => part).join(', ');
});

// Virtual for store identifier
storeSchema.virtual('storeIdentifier').get(function() {
  return `${this.name} - ${this.location}`;
});

// Pre-save middleware to validate phone number format
storeSchema.pre('save', function(next) {
  // Basic Ghana phone number validation
  const phoneRegex = /^(\+233|0)[0-9]{9}$/;
  if (!phoneRegex.test(this.phone)) {
    return next(new Error('Please enter a valid Ghana phone number'));
  }
  next();
});

// Static method to find active stores
storeSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to find stores by location
storeSchema.statics.findByLocation = function(city: string, state?: string) {
  const query: any = { city: { $regex: city, $options: 'i' }, isActive: true };
  if (state) query.state = { $regex: state, $options: 'i' };
  return this.find(query).sort({ name: 1 });
};

// Static method to search stores
storeSchema.statics.search = function(query: string) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { location: { $regex: query, $options: 'i' } },
          { city: { $regex: query, $options: 'i' } },
          { address: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).sort({ name: 1 });
};

// Instance method to deactivate store
storeSchema.methods.deactivate = function(reason?: string, updatedBy?: mongoose.Types.ObjectId) {
  this.isActive = false;
  if (reason) this.notes = (this.notes || '') + `\nDeactivated: ${reason}`;
  if (updatedBy) this.updatedBy = updatedBy;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to reactivate store
storeSchema.methods.reactivate = function(updatedBy?: mongoose.Types.ObjectId) {
  this.isActive = true;
  if (updatedBy) this.updatedBy = updatedBy;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to check if store is currently open
storeSchema.methods.isCurrentlyOpen = function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = this.openingHours[dayOfWeek as keyof typeof this.openingHours];
  if (!todayHours) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

export const Store = mongoose.model<IStore>('Store', storeSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IBatch {
  batchNumber: string;
  quantity: number;
  expiryDate: Date;
  purchasePrice: number;
  supplier: string;
  receivedDate: Date;
}

export interface IInventory extends Document {
  drug: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  quantity: number;
  batches: IBatch[];
  sellingPrice: number;
  status: 'active' | 'inactive' | 'discontinued';
  notes?: string;
  reorderPoint: number;
  lastRestocked: Date;
  createdAt: Date;
  updatedAt: Date;
}

const batchSchema = new Schema<IBatch>({
  batchNumber: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  receivedDate: {
    type: Date,
    default: Date.now
  }
});

const inventorySchema = new Schema<IInventory>({
  drug: {
    type: Schema.Types.ObjectId,
    ref: 'Drug',
    required: true
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  batches: [batchSchema],
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  },
  reorderPoint: {
    type: Number,
    default: 10,
    min: 0
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique drug-store combinations
inventorySchema.index({ drug: 1, store: 1 }, { unique: true });

// Index for efficient queries
inventorySchema.index({ store: 1, status: 1 });
inventorySchema.index({ 'batches.expiryDate': 1 });

// Virtual for checking if stock is low
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.reorderPoint;
});

// Virtual for checking if any batches are expiring soon
inventorySchema.virtual('expiringSoon').get(function() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return this.batches.some((batch: IBatch) => 
    batch.expiryDate <= thirtyDaysFromNow && batch.expiryDate > new Date()
  );
});

// Method to add new batch
inventorySchema.methods.addBatch = function(batch: IBatch) {
  this.batches.push(batch);
  this.quantity += batch.quantity;
  this.lastRestocked = new Date();
  return this.save();
};

// Method to remove expired batches
inventorySchema.methods.removeExpiredBatches = function() {
  const now = new Date();
  const expiredBatches = this.batches.filter((batch: IBatch) => batch.expiryDate <= now);
  
  // Calculate total expired quantity
  const expiredQuantity = expiredBatches.reduce((sum: number, batch: IBatch) => sum + batch.quantity, 0);
  
  // Remove expired batches
  this.batches = this.batches.filter((batch: IBatch) => batch.expiryDate > now);
  this.quantity -= expiredQuantity;
  
  return this.save();
};

// Pre-save middleware to update quantity from batches
inventorySchema.pre('save', function(next) {
  if (this.isModified('batches')) {
    this.quantity = this.batches.reduce((sum: number, batch: IBatch) => sum + batch.quantity, 0);
  }
  next();
});

export const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);

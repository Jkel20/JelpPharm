import mongoose, { Document, Schema } from 'mongoose';

export interface ISale extends Document {
  drug: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  cashier: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'mobile_money' | 'insurance';
  customerNotes?: string;
  refundReason?: string;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const saleSchema = new Schema<ISale>({
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
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  cashier: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile_money', 'insurance'],
    default: 'cash'
  },
  customerNotes: {
    type: String,
    trim: true
  },
  refundReason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled', 'refunded'],
    default: 'completed'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
saleSchema.index({ store: 1, createdAt: -1 });
saleSchema.index({ customer: 1, createdAt: -1 });
saleSchema.index({ drug: 1, createdAt: -1 });
saleSchema.index({ cashier: 1, createdAt: -1 });
saleSchema.index({ status: 1 });
saleSchema.index({ paymentMethod: 1 });

// Virtual for profit calculation (if cost price is available)
saleSchema.virtual('profit').get(function() {
  // This would need to be calculated based on inventory cost price
  // For now, returning 0 as we don't have cost price in this model
  return 0;
});

// Virtual for tax calculation (if applicable)
saleSchema.virtual('tax').get(function() {
  // This would be calculated based on local tax rates
  // For now, returning 0
  return 0;
});

// Pre-save middleware to calculate totals
saleSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('unitPrice') || this.isModified('discount')) {
    this.subtotal = this.quantity * this.unitPrice;
    this.discountAmount = (this.discount / 100) * this.subtotal;
    this.totalAmount = this.subtotal - this.discountAmount;
  }
  next();
});

// Pre-save middleware to validate totals
saleSchema.pre('save', function(next) {
  if (this.totalAmount < 0) {
    return next(new Error('Total amount cannot be negative'));
  }
  next();
});

// Static method to get daily sales
saleSchema.statics.getDailySales = function(storeId: mongoose.Types.ObjectId, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    store: storeId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    status: 'completed'
  }).populate('drug customer cashier');
};

// Static method to get monthly sales
saleSchema.statics.getMonthlySales = function(storeId: mongoose.Types.ObjectId, year: number, month: number) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  
  return this.find({
    store: storeId,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    status: 'completed'
  }).populate('drug customer cashier');
};

// Static method to get top selling drugs
saleSchema.statics.getTopSellingDrugs = function(storeId: mongoose.Types.ObjectId, limit: number = 10, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        store: storeId,
        createdAt: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$drug',
        totalQuantity: { $sum: '$quantity' },
        totalRevenue: { $sum: '$totalAmount' },
        saleCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'drugs',
        localField: '_id',
        foreignField: '_id',
        as: 'drug'
      }
    },
    {
      $unwind: '$drug'
    }
  ]);
};

// Instance method to refund sale
saleSchema.methods.refund = function(reason: string, updatedBy: mongoose.Types.ObjectId) {
  if (this.status !== 'completed') {
    throw new Error('Only completed sales can be refunded');
  }
  
  this.status = 'refunded';
  this.refundReason = reason;
  this.updatedBy = updatedBy;
  this.updatedAt = new Date();
  
  return this.save();
};

// Instance method to cancel sale
saleSchema.methods.cancel = function(_reason: string, updatedBy: mongoose.Types.ObjectId) {
  if (this.status === 'completed') {
    throw new Error('Completed sales cannot be cancelled, use refund instead');
  }
  
  this.status = 'cancelled';
  this.updatedBy = updatedBy;
  this.updatedAt = new Date();
  
  return this.save();
};

export const Sale = mongoose.model<ISale>('Sale', saleSchema);

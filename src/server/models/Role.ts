import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  code: string;
  privileges: mongoose.Types.ObjectId[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Role name cannot exceed 100 characters']
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
    match: [/^[A-Z_]+$/, 'Role code can only contain uppercase letters and underscores']
  },
  privileges: [{
    type: Schema.Types.ObjectId,
    ref: 'Privilege',
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
roleSchema.index({ code: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ isSystem: 1 });

// Virtual for privilege count
roleSchema.virtual('privilegeCount').get(function() {
  return this.privileges.length;
});

// Static method to find active roles
roleSchema.statics.findActive = function() {
  return this.find({ isActive: true }).populate('privileges').sort({ name: 1 });
};

// Static method to find role by code
roleSchema.statics.findByCode = function(code: string) {
  return this.findOne({ code, isActive: true }).populate('privileges');
};

// Instance method to add privilege
roleSchema.methods.addPrivilege = function(privilegeId: mongoose.Types.ObjectId) {
  if (!this.privileges.includes(privilegeId)) {
    this.privileges.push(privilegeId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove privilege
roleSchema.methods.removePrivilege = function(privilegeId: mongoose.Types.ObjectId) {
  this.privileges = this.privileges.filter((id: mongoose.Types.ObjectId) => !id.equals(privilegeId));
  return this.save();
};

// Instance method to check if role has privilege
roleSchema.methods.hasPrivilege = function(privilegeCode: string) {
  return this.privileges.some((privilege: mongoose.Types.ObjectId) => {
    // Note: This method assumes privileges are populated
    // In practice, you'd want to populate privileges before calling this method
    return (privilege as any).code === privilegeCode;
  });
};

export const Role = mongoose.model<IRole>('Role', roleSchema);

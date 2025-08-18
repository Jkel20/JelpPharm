import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  role: 'Administrator' | 'Pharmacist' | 'Cashier' | 'Store Manager';
  storeId?: mongoose.Types.ObjectId;
  isActive: boolean;
  isLocked: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  lockAccount(): Promise<void>;
  unlockAccount(): Promise<void>;
}

const userSchema = new Schema<IUser>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(\+233|0)[0-9]{9}$/, 'Please enter a valid Ghana phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(password: string) {
        // Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        return passwordRegex.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
    }
  },
  role: {
    type: String,
    required: [true, 'User role is required'],
    enum: {
      values: ['Administrator', 'Pharmacist', 'Cashier', 'Store Manager'],
      message: 'Role must be Administrator, Pharmacist, Cashier, or Store Manager'
    }
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: function(this: IUser) {
      return this.role !== 'Administrator';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: function(_doc, ret) { delete ret['password']; return ret; } },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ storeId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for checking if account is locked
userSchema.virtual('isAccountLocked').get(function(this: IUser) {
  return !!(this.isLocked || this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env['BCRYPT_ROUNDS'] || '12'));
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to validate store assignment
userSchema.pre('save', function(next) {
  if (this.role === 'Administrator' && this.storeId) {
    return next(new Error('Administrators cannot be assigned to specific stores'));
  }
  if (this.role !== 'Administrator' && !this.storeId) {
    return next(new Error('Non-administrator users must be assigned to a store'));
  }
  next();
});

// Method to compare password
(userSchema.methods as any).comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this['password']);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to increment login attempts
(userSchema.methods as any).incrementLoginAttempts = async function(): Promise<void> {
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  if (this['loginAttempts'] + 1 >= parseInt(process.env['LOGIN_ATTEMPTS_LIMIT'] || '5')) {
    updates.$set = { 
      isLocked: true, 
      lockUntil: new Date(Date.now() + parseInt(process.env['LOGIN_LOCKOUT_DURATION_MS'] || '900000'))
    };
  }
  
  await this['updateOne'](updates);
  Object.assign(this, updates);
};

// Method to reset login attempts
(userSchema.methods as any).resetLoginAttempts = async function(): Promise<void> {
  await this['updateOne']({
    $set: { 
      loginAttempts: 0, 
      isLocked: false, 
      lockUntil: undefined 
    }
  });
  this['loginAttempts'] = 0;
  this['isLocked'] = false;
  this['lockUntil'] = undefined;
};

// Method to lock account
(userSchema.methods as any).lockAccount = async function(): Promise<void> {
  await this['updateOne']({
    $set: { 
      isLocked: true, 
      lockUntil: new Date(Date.now() + parseInt(process.env['LOGIN_LOCKOUT_DURATION_MS'] || '900000'))
    }
  });
  this['isLocked'] = true;
  this['lockUntil'] = new Date(Date.now() + parseInt(process.env['LOGIN_LOCKOUT_DURATION_MS'] || '900000'));
};

// Method to unlock account
(userSchema.methods as any).unlockAccount = async function(): Promise<void> {
  await this['updateOne']({
    $set: { 
      isLocked: false, 
      lockUntil: undefined,
      loginAttempts: 0
    }
  });
  this['isLocked'] = false;
  this['lockUntil'] = undefined;
  this['loginAttempts'] = 0;
};

export const User = mongoose.model<IUser>('User', userSchema);

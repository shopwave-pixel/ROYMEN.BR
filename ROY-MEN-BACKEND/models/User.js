import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email field is mandatory'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[w-.]+@([w-]+.)+[w-]{2,4}$/, 'Please supply a standard active email']
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Display name is mandatory'],
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  shippingAddress: {
    street: String,
    city: String,
    district: String,
    postalCode: String,
    country: { type: String, default: 'Bangladesh' }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Single Compound Indexing to quicken administrative dashboard searches & login checks
UserSchema.index({ email: 1, role: 1 });

export default mongoose.model('User', UserSchema);

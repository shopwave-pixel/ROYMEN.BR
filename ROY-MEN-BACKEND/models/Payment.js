import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Payment executioner reference is required']
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Parent order reference identifier is required']
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'bKash', 'Nagad'],
    required: [true, 'Payment method designation is required']
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount value is required'],
    min: [0, 'Transaction value can not represent a negative figure']
  },
  transactionId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allows null/empty values to exist concurrently (useful for standard COD paths)
  },
  senderPhone: {
    type: String,
    trim: true,
    required: function() {
      return ['bKash', 'Nagad'].includes(this.paymentMethod);
    },
    message: 'Mobile financial portals track records using active Sender Phone numbers'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexing targeting order & transaction matching routines
PaymentSchema.index({ order: 1, transactionId: 1 });

export default mongoose.model('Payment', PaymentSchema);

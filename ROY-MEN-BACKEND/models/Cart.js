import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  size: {
    type: String,
    required: [true, 'Size specification is required']
  },
  color: {
    type: String,
    required: [true, 'Color specification is required'],
    default: 'Default'
  },
  price: {
    type: Number,
    required: [true, 'Snapshot price points are required']
  }
}, {
  _id: false // Disable nested auto-ID creation
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Cart owner identifier is mandatory'],
    unique: true
  },
  items: [CartItemSchema],
  totalPrice: {
    type: Number,
    default: 0,
    required: true
  }
}, {
  timestamps: true
});

// Middleware hook to automatically compute totalPrice
CartSchema.pre('save', function (next) {
  this.totalPrice = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

export default mongoose.model('Cart', CartSchema);

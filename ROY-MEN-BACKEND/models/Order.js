import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is mandatory']
  },
  name: {
    type: String,
    required: [true, 'Product name snapshot is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  size: {
    type: String,
    required: [true, 'Size specification is required']
  },
  color: {
    type: String,
    required: [true, 'Color specification is required']
  },
  price: {
    type: Number,
    required: [true, 'Snapshot rate is required']
  }
}, {
  _id: false
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order owner is mandatory']
  },
  orderItems: [OrderItemSchema],
  shippingAddress: {
    street: { type: String, required: [true, 'Street address is required'] },
    city: { type: String, required: [true, 'City is required'] },
    district: { type: String, required: [true, 'District is required'] },
    postalCode: { type: String, required: [true, 'Postal Code is required'] },
    country: { type: String, default: 'Bangladesh' }
  },
  phone: {
    type: String,
    required: [true, 'Contact phone number is mandatory for shipping coordination']
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'bKash', 'Nagad'],
    required: [true, 'Payment method designation is required']
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 60 // Default inside-Dhaka rate, or adjustable
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate grand total including shipping price before validations
OrderSchema.pre('validate', function (next) {
  if (this.orderItems && this.orderItems.length > 0) {
    const itemsTotal = this.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.totalPrice = itemsTotal + (this.shippingPrice || 0);
  }
  next();
});

// Single Compound Indexing to quicken dashboard lookups & analytics
OrderSchema.index({ user: 1, orderStatus: 1, createdAt: -1 });

export default mongoose.model('Order', OrderSchema);

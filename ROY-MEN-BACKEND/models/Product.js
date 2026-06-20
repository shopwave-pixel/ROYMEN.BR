import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product label/name is mandatory'],
    trim: true,
    maxLength: [120, 'Product name cannot exceed 120 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU stock tracking identification identifier is mandatory'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Detailed markdown / textual description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product sales base price points are required'],
    min: [0, 'Sales markup must represent a non-negative digit value']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount index bounds must represent a positive number'],
    validate: {
      validator: function (val) {
        // Only run check if discountPrice is provided and positive
        return !val || val < this.price;
      },
      message: 'Product promotions rate must fall below the standard list price ({VALUE})'
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Parent categorisation field lookup reference is required']
  },
  images: [{
    secureUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  sizes: {
    type: [String],
    enum: ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'Free Size'],
    default: ['Free Size']
  },
  colors: {
    type: [String],
    default: ['Default']
  },
  stock: {
    type: Number,
    required: [true, 'Inventory amount tracking is mandatory'],
    min: [0, 'Item inventory count floor level is 0'],
    default: 10
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexing strategies to resolve fast querying
ProductSchema.index({ name: 'text', description: 'text' }, { weights: { name: 5, description: 1 } });
ProductSchema.index({ category: 1, price: 1, isFeatured: 1 });
ProductSchema.index({ sku: 1 }, { unique: true });

// Pre-save slug generation
ProductSchema.pre('validate', function (next) {
  if (this.name && (this.isModified('name') || !this.slug)) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 6);
  }
  next();
});

export default mongoose.model('Product', ProductSchema);

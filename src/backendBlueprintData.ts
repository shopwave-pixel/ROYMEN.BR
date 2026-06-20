// ROY MEN - Complete Production-Ready Express & Node.js Backend Blueprint Data

export interface FileBlueprint {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileBlueprint[];
  description?: string;
  imports?: string[];
  exports?: string[];
  technologies?: string[];
  blueprintCode?: string;
}

export interface MongooseModel {
  name: string;
  description: string;
  fields: {
    name: string;
    type: string;
    required: boolean;
    unique?: boolean;
    default?: string;
    description: string;
  }[];
  indexes: string[];
  middlewares: string[];
  virtuals?: string[];
}

export interface ApiRoute {
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requiresAuth: 'Guest' | 'User' | 'Admin' | 'OTP-Pending';
  headers: Record<string, string>;
  queryParams?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: string;
  responseSuccess: string;
  responseError?: string;
  simulatedQueryLogs?: string[];
}

export const BACKEND_FOLDER_TREE: FileBlueprint = {
  name: "ROY-MEN-BACKEND",
  path: "",
  type: "folder",
  children: [
    {
      name: "config",
      path: "config",
      type: "folder",
      children: [
        {
          name: "db.js",
          path: "config/db.js",
          type: "file",
          description: "Establishes a highly resilient connection pool to MongoDB Atlas using Mongoose, featuring auto-reconnect logic and connection event monitoring.",
          imports: ["mongoose", "colors", "dotenv"],
          exports: ["connectDB"],
          technologies: ["Mongoose", "MongoDB Atlas"],
          blueprintCode: `import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip IPv6 refinement
    });

    console.log(\`[DB] MongoDB Connected: \${conn.connection.host}\`.cyan.underline);

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected! Attempting reconnect...'.yellow);
    });

    mongoose.connection.on('error', (err) => {
      console.error(\`[DB] MongoDB Connection Error: \${err.message}\`.red);
    });

  } catch (error) {
    console.error(\`[DB] Error: \${error.message}\`.red.bold);
    process.exit(1);
  }
};

export default connectDB;`
        },
        {
          name: "cloudinary.js",
          path: "config/cloudinary.js",
          type: "file",
          description: "Configures Cloudinary SDK with environment API secrets, defining secure CDN dynamic folders and automated transformation presets for product images.",
          imports: ["cloudinary (v2)", "dotenv"],
          exports: ["cloudinary", "uploadToCloudinary"],
          technologies: ["Cloudinary v2"],
          blueprintCode: `import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Custom Cloudinary Upload Pipeline
 * Handles image streaming, standard resizing, security optimization, and quality WebP compression
 */
export const uploadImage = async (fileBuffer, folder = 'roy-men-products') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({
      folder,
      resource_type: 'image',
      format: 'webp',
      quality: 'auto:good',
      transformation: [{ width: 1000, height: 1250, crop: 'fill', gravity: 'north' }] // 4:5 fashion aspect ratio
    }, (error, result) => {
      if (error) return reject(error);
      resolve({
        url: result.secure_url,
        publicId: result.public_id
      });
    }).end(fileBuffer);
  });
};

export default cloudinary;`
        },
        {
          name: "nodemailer.js",
          path: "config/nodemailer.js",
          type: "file",
          description: "Provisions Nodemailer SMTP Transporter using secure SSL configuration for relaying authentic custom HTML login OTP emails to Bangladeshi menswear clients.",
          imports: ["nodemailer", "dotenv"],
          exports: ["transporter", "sendOTPEmail"],
          technologies: ["Nodemailer", "SMTP Relay"],
          blueprintCode: `import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  pool: true, // Use SMTP pooled connections
  maxConnections: 5
});

/**
 * Send Multi-language English/Bengaling OTP Email
 */
export const sendOTPEmail = async (email, otpCode) => {
  const mailOptions = {
    from: \`"ROY MEN" <\${process.env.SMTP_USER}>\`,
    to: email,
    subject: "ROY MEN - Verification Security OTP Code",
    html: \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #12141c; font-size: 28px; margin: 0; letter-spacing: 2px;">ROY MEN</h2>
          <span style="color: #d4af37; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px;">Wear Confidence</span>
        </div>
        <p style="font-size: 16px; color: #475569;">Hello,</p>
        <p style="font-size: 16px; color: #475569; line-height: 1.5;">You requested a secure verification code to access your ROY MEN account. Use the session-bound OTP code below to authenticate. This OTP is valid for <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="background-color: #f8fafc; border: 2px dashed #d4af37; display: inline-block; padding: 12px 36px; border-radius: 6px;">
            <span style="font-size: 32px; font-weight: bold; color: #12141c; letter-spacing: 6px; font-family: 'Courier New', monospace;">\${otpCode}</span>
          </div>
        </div>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          If you did not request this code, no action is required. Please secure your account credentials immediately.
          <br/><br/>
          &copy; 2026 ROY MEN Bangladesh. All Rights Reserved.
        </p>
      </div>
    \`
  };

  return await transporter.sendMail(mailOptions);
};`
        }
      ]
    },
    {
      name: "models",
      path: "models",
      type: "folder",
      children: [
        {
          name: "User.js",
          path: "models/User.js",
          type: "file",
          description: "Defines the core Customer/Admin mongoose document schemas, carrying structural indexes on email and phone, role RBAC tokens, and profiles.",
          imports: ["mongoose", "bcryptjs"],
          exports: ["User"],
          technologies: ["Mongoose Schema", "Mongoose Indices"],
          blueprintCode: `import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email field is mandatory'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/, 'Please supply a standard active email']
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

// Single Compound Indexing to quicken administrative dashboard searches
UserSchema.index({ email: 1, role: 1 });

export default mongoose.model('User', UserSchema);`
        },
        {
          name: "Product.js",
          path: "models/Product.js",
          type: "file",
          description: "Stores individual garment blueprints, colorways, sizes with discrete inventory matrices, images (referencing public Cloudinary IDs) and rating statistics.",
          imports: ["mongoose"],
          exports: ["Product"],
          technologies: ["Mongoose Schema", "Geospatial Text Indexes"],
          blueprintCode: `import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Garment title is mandatory'],
    trim: true,
    maxLength: [120, 'Title cannot exceed 120 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Detailed fabric/cut description is required']
  },
  price: {
    type: Number,
    required: [true, 'Base price in BDT is mandatory'],
    min: [0, 'Price must be positive']
  },
  discountPrice: {
    type: Number,
    validate: {
      validator: function(val) {
        return !val || val < this.price;
      },
      message: 'Discount Price must always fall below Base Price'
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Assigned parent category is missing']
  },
  subCategory: {
    type: String,
    enum: ['unstitched', 'panjabi', 'shirt', 'polo', 'tshirt', 'chino', 'denim', 'blazer'],
    required: true
  },
  images: [{
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true }
  }],
  sizes: [{
    size: {
      type: String,
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
      required: true
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 4.5
  }
}, {
  timestamps: true
});

// Compound text indexing for high-speed dynamic search triggers
ProductSchema.index({ title: 'text', description: 'text', subCategory: 'text' });
ProductSchema.index({ price: 1, category: 1 });

// Slug creation middleware hook
ProductSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

export default mongoose.model('Product', ProductSchema);`
        },
        {
          name: "Category.js",
          path: "models/Category.js",
          type: "file",
          description: "Defines nested categories (e.g. Traditional, Casual, Formal, Loungewear) to optimize e-commerce browsing structures.",
          imports: ["mongoose"],
          exports: ["Category"],
          technologies: ["Mongoose Schema"],
          blueprintCode: `import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: String,
  imageSecureUrl: String
}, {
  timestamps: true
});

CategorySchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  next();
});

export default mongoose.model('Category', CategorySchema);`
        },
        {
          name: "Order.js",
          path: "models/Order.js",
          type: "file",
          description: "Manages final e-commerce transaction details, keeping accurate record of bKash/Nagad transactions, and transit timelines.",
          imports: ["mongoose"],
          exports: ["Order"],
          technologies: ["Mongoose Schema"],
          blueprintCode: `import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  shippingDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: String
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'bKash', 'Nagad'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Submitted', 'Verified', 'Failed'],
    default: 'Pending'
  },
  manualPaymentDetails: {
    senderNumber: String,
    transactionId: String,
    submittedAt: Date,
    amountPaid: Number
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 120.0 // BDT 120 Outside Dhaka, can override dynamically
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

OrderSchema.index({ user: 1, orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', OrderSchema);`
        },
        {
          name: "Otp.js",
          path: "models/Otp.js",
          type: "file",
          description: "Implements transient TTL models to auto-expire temporary registers under standard email verification flows.",
          imports: ["mongoose"],
          exports: ["Otp"],
          technologies: ["Mongoose TTL Index"],
          blueprintCode: `import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otpCode: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['registration', 'login'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Auto-purge document in 10 minutes (600 seconds)
  }
});

// Force compound searching to authenticate rapidly
OtpSchema.index({ email: 1, otpCode: 1 }, { unique: true });

export default mongoose.model('Otp', OtpSchema);`
        }
      ]
    },
    {
      name: "middleware",
      path: "middleware",
      type: "folder",
      children: [
        {
          name: "authMiddleware.js",
          path: "middleware/authMiddleware.js",
          type: "file",
          description: "Guards REST endpoints. Verifies JWT authenticity and triggers dynamic RBAC filters targeting exclusive customer/admin resources.",
          imports: ["jsonwebtoken", "User"],
          exports: ["protect", "authorize"],
          technologies: ["JWT Decryption", "Express Pipeline"],
          blueprintCode: `import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode validation signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Mutate Request pipeline to inject verified User structure (bypass heavy DB read when possible)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User matching token signature no longer exists.' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: 'Your ROY MEN access has been administratively deactivated.' });
      }

      next();
    } catch (error) {
      console.error('[AUTH] Token verification failure:', error.message);
      return res.status(401).json({ success: false, message: 'Authorization rejected, signature expired or invalid.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No bearer authorization token supplied.' });
  }
};

/**
 * Role-Based Access Control Filtering
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: \`Operation Forbidden: Requester role '\${req.user ? req.user.role : 'Guest'}' lacks administrative clearance.\` 
      });
    }
    next();
  };
};`
        },
        {
          name: "errorMiddleware.js",
          path: "middleware/errorMiddleware.js",
          type: "file",
          description: "Acts as a centralized exception handling boundary catches syntax, CastErrors, validation issues, or duplicate database records cleanly.",
          imports: [],
          exports: ["errorHandler", "notFoundHandler"],
          technologies: ["Express Global Boundary"],
          blueprintCode: `/**
 * Custom 404 Route Fallback
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(\`Resource not found: \${req.originalUrl}\`);
  res.status(404);
  next(error);
};

/**
 * Unified Global Server Exception Parser
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Custom Mongoose bad ObjectId mapping
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource reference identifier not found (Malformed ObjectId)';
  }

  // Custom Mongo duplicate key handling
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = \`Duplicate field entry recorded. The value supplied for resource '\${field}' already exists.\`;
  }

  // Custom validation failure formatting
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  console.error(\`[ERROR_PIPELINE] \${req.method} \${req.url} - Error: \${err.stack}\`.red);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? '🔒' : err.stack
  });
};`
        },
        {
          name: "uploadMiddleware.js",
          path: "middleware/uploadMiddleware.js",
          type: "file",
          description: "Configures transient Multer disk buffers to intercept, size-limit and whitelist specific image extensions (`.png`, `.jpg`, `.webp`) before cloud transmission.",
          imports: ["multer"],
          exports: ["uploadSingle", "uploadMultiple"],
          technologies: ["Multer Upload Pipe"],
          blueprintCode: `import multer from 'multer';

// In-Memory store limits storage footprint, files are passed to stream directly
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype;
  if (mimeType.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Extension rejected: Only raw images are supported for upload.'), false);
  }
};

export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024 // Strict 4MB size ceiling per product card image
  }
});

export const uploadProductPhotos = uploadMedia.array('images', 5); // Max 5 image frames per catalogue item

export default uploadProductPhotos;`
        }
      ]
    },
    {
      name: "controllers",
      path: "controllers",
      type: "folder",
      children: [
        {
          name: "authController.js",
          path: "controllers/authController.js",
          type: "file",
          description: "Orchestrates primary verification logic. Spawns random 6-digit session codes, coordinates Nodemailer signals and signs user JWT keys.",
          imports: ["Otp", "User", "sendOTPEmail", "jwt"],
          exports: ["requestOtp", "verifyOtpAndLogin"],
          blueprintCode: `import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Otp from '../models/Otp.js';
import User from '../models/User.js';
import { sendOTPEmail } from '../config/nodemailer.js';

const generateJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME || '30d'
  });
};

/**
 * @desc    Generate and send single session 6-Digit OTP to User Email
 * @route   POST /api/v1/auth/otp/send
 * @access  Public
 */
export const requestOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body; // purpose: 'registration' or 'login'

    if (!email) {
      res.status(400);
      throw new Error('Please supply a standard active e-mail handle.');
    }

    // Spawn 6-Digit cryptographic integers
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store secure short-term record
    await Otp.findOneAndDelete({ email, purpose }); // Clear stale records
    await Otp.create({ email, otpCode, purpose });

    // Send via Nodemailer transporter
    await sendOTPEmail(email, otpCode);

    res.status(200).json({
      success: true,
      message: \`Temporary verification security code successfully dispatched to \${email}.\`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP and sign custom session authorization token
 * @route   POST /api/v1/auth/otp/verify
 * @access  Public
 */
export const verifyOtpAndLogin = async (req, res, next) => {
  try {
    const { email, otpCode, purpose, name, phone } = req.body;

    if (!email || !otpCode) {
      res.status(400);
      throw new Error('Mandatory credentials (email & verification OTP) are absent.');
    }

    // Verify code existence
    const verifiedOtp = await Otp.findOne({ email, otpCode, purpose });
    if (!verifiedOtp) {
      res.status(401);
      throw new Error('The activation OTP supplied is invalid or expired.');
    }

    // Garbage-collect verified code immediately (one-time-use constraint)
    await Otp.deleteOne({ _id: verifiedOtp._id });

    // Find or Provision Customer Profile
    let user = await User.findOne({ email });

    if (!user) {
      if (purpose === 'registration') {
        if (!name) {
          res.status(400);
          throw new Error('Initial registration profiles require a Display Name.');
        }
        user = await User.create({
          email,
          name,
          phone: phone || '',
          role: 'customer'
        });
      } else {
        res.status(404);
        throw new Error('Profile does not exist. Please trigger registration flows instead.');
      }
    }

    // Issue Token
    const accessToken = generateJWT(user._id);

    res.status(200).json({
      success: true,
      message: 'Email successfully verified, secure session signed.',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shippingAddress: user.shippingAddress
      }
    });

  } catch (error) {
    next(error);
  }
};`
        },
        {
          name: "productController.js",
          path: "controllers/productController.js",
          type: "file",
          description: "Runs product queries. Employs regex search filters for subcategories, sizes and BDT price range bounds, and resolves administrative product additions.",
          imports: ["Product", "Category", "uploadImage"],
          exports: ["getProducts", "getProductBySlug", "adminCreateProduct", "adminDeleteProduct"],
          blueprintCode: `import Product from '../models/Product.js';
import { uploadImage } from '../config/cloudinary.js';

/**
 * @desc    Fetch and filter catalogue products (Dynamic search, filter and pagination queries)
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, subCategory, size, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const query = {};

    // Text search query implementation
    if (search) {
      query.$text = { $search: search };
    }

    // Strict sub-category limits
    if (subCategory) {
      query.subCategory = subCategory;
    }

    // Size filtering inside sub-arrays
    if (size) {
      query['sizes.size'] = size;
    }

    // Dynamic price bound filters
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Base query setup
    let queryPromise = Product.find(query).populate('category', 'name slug');

    // Sorting strategies
    if (sort === 'price-low') {
      queryPromise = queryPromise.sort({ price: 1 });
    } else if (sort === 'price-high') {
      queryPromise = queryPromise.sort({ price: -1 });
    } else if (sort === 'newest') {
      queryPromise = queryPromise.sort({ createdAt: -1 });
    } else {
      // Default: relevance (for text search) or newest
      queryPromise = queryPromise.sort({ isFeatured: -1, createdAt: -1 });
    }

    // Pagination metrics
    const currentPage = Number(page);
    const sizeCeiling = Number(limit);
    const skipDocs = (currentPage - 1) * sizeCeiling;

    const totalRecords = await Product.countDocuments(query);
    const products = await queryPromise.skip(skipDocs).limit(sizeCeiling);

    res.status(200).json({
      success: true,
      count: products.length,
      totalPages: Math.ceil(totalRecords / sizeCeiling),
      currentPage,
      totalRecords,
      products
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload product photos to Cloudinary and insert records inside database collections
 * @route   POST /api/v1/products/admin
 * @access  Private/Admin
 */
export const adminCreateProduct = async (req, res, next) => {
  try {
    const { title, description, price, discountPrice, category, subCategory, sizes } = req.body;
    
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('Please supply at least one product description snapshot (images list empty).');
    }

    // Stream process buffers up to Cloudinary v2 CDN
    const uploadedImages = [];
    for (const file of req.files) {
      const uploadResult = await uploadImage(file.buffer);
      uploadedImages.push({
        secureUrl: uploadResult.url,
        publicId: uploadResult.publicId
      });
    }

    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category,
      subCategory,
      sizes: parsedSizes,
      images: uploadedImages
    });

    res.status(201).json({
      success: true,
      message: 'E-commerce item safely listed and imagery securely cached inside CDN.',
      product
    });

  } catch (error) {
    next(error);
  }
};`
        },
        {
          name: "orderController.js",
          path: "controllers/orderController.js",
          type: "file",
          description: "Manages orders, updating item inventories dynamically upon checkout and checking manual bKash/Nagad transactions.",
          imports: ["Order", "Product"],
          exports: ["createOrder", "getOrders", "adminVerifyOrderPayment", "adminUpdateOrderStatus"],
          blueprintCode: `import Order from '../models/Order.js';
import Product from '../models/Product.js';

/**
 * @desc    Submit Checkout Invoice & Deduct stock inventories automatically
 * @route   POST /api/v1/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingDetails, paymentMethod, manualPaymentDetails, shippingPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('Your shopping checkout parcel is currently empty.');
    }

    // 1. Double check collection stock pools and acquire total values
    let calculatedTotal = 0;
    const updateOperations = [];

    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        res.status(404);
        throw new Error(\`Checkout halted: Product '\${item.title}' no longer exists.\`);
      }

      // Identify corresponding size pool
      const sizeIndex = dbProduct.sizes.findIndex(s => s.size === item.size);
      if (sizeIndex === -1 || dbProduct.sizes[sizeIndex].stock < item.quantity) {
        res.status(400);
        throw new Error(\`Insufficient stock pool available for size \${item.size} of design '\${dbProduct.title}'.\`);
      }

      // Increment price
      calculatedTotal += (dbProduct.discountPrice || dbProduct.price) * item.quantity;

      // Update structural query queue
      updateOperations.push({
        updateOne: {
          filter: { _id: item.product, 'sizes.size': item.size },
          update: { $inc: { 'sizes.$.stock': -item.quantity } }
        }
      });
    }

    // Set payment state
    const paymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Submitted';

    // 2. Perform bulk inventory deductions atomic validation and issue Order
    await Product.bulkWrite(updateOperations);

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingDetails,
      paymentMethod,
      paymentStatus,
      manualPaymentDetails: paymentMethod !== 'COD' ? {
        senderNumber: manualPaymentDetails?.senderNumber,
        transactionId: manualPaymentDetails?.transactionId,
        submittedAt: new Date(),
        amountPaid: calculatedTotal + (shippingPrice || 120)
      } : undefined,
      totalPrice: calculatedTotal,
      shippingPrice: shippingPrice || 120
    });

    res.status(201).json({
      success: true,
      message: 'Order created. Payment verification initialized and garment inventory allocated.',
      order
    });

  } catch (error) {
    next(error);
  }
};`
        },
        {
          name: "analyticsController.js",
          path: "controllers/analyticsController.js",
          type: "file",
          description: "Generates administrative metrics summaries, running pipeline aggregates over sales channels like COD, bKash, and Nagad.",
          imports: ["Order", "Product", "User"],
          exports: ["getAdminDashStats"],
          blueprintCode: `import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

/**
 * @desc    Serve deep administrative aggregated revenue analytics reports
 * @route   GET /api/v1/analytics/dashboard
 * @access  Private/Admin
 */
export const getAdminDashStats = async (req, res, next) => {
  try {
    // Pipeline aggregates: Cumulative Total Sales Revenue mapping only 'Delivered' elements
    const revenueStats = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);

    const totalRevenue = revenueStats[0] ? revenueStats[0].totalRevenue : 0;

    // Metrics segments counts
    const customerCount = await User.countDocuments({ role: 'customer' });
    const outstandingOrdersCount = await Order.countDocuments({ orderStatus: { $ne: 'Delivered' } });
    const productCatalogCount = await Product.countDocuments();

    // Sales charts dataset: daily revenue curves
    const daysOffset = 7;
    const startRange = new Date();
    startRange.setDate(startRange.getDate() - daysOffset);

    const chartsRevenueByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: startRange }, orderStatus: 'Delivered' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Distribution of Payment Methods mapping inside ROY MEN pipeline
    const paymentDistribution = await Order.aggregate([
      { $group: { _id: '$paymentMethod', value: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        totalRevenue,
        customerCount,
        outstandingOrdersCount,
        productCatalogCount
      },
      charts: {
        dailyRevenue: chartsRevenueByDay,
        paymentDistribution
      }
    });

  } catch (error) {
    next(error);
  }
};`
        }
      ]
    },
    {
      name: "routes",
      path: "routes",
      type: "folder",
      children: [
        {
          name: "authRoutes.js",
          path: "routes/authRoutes.js",
          type: "file",
          description: "Maps user activation endpoints like sending and verifying OTP and creating sessions.",
          blueprintCode: `import express from 'express';
import { requestOtp, verifyOtpAndLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/otp/send', requestOtp);
router.post('/otp/verify', verifyOtpAndLogin);

export default router;`
        },
        {
          name: "productRoutes.js",
          path: "routes/productRoutes.js",
          type: "file",
          description: "Standardizes Product search pipelines while implementing strict middleware authorization checks over administrative additions.",
          blueprintCode: `import express from 'express';
import { getProducts, adminCreateProduct } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadProductPhotos } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProducts);

// Secured creation actions
router.post('/admin', protect, authorize('admin'), uploadProductPhotos, adminCreateProduct);

export default router;`
        },
        {
          name: "orderRoutes.js",
          path: "routes/orderRoutes.js",
          type: "file",
          description: "Organizes secure client order transactions and manages general administrative invoice checks.",
          blueprintCode: `import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder);

export default router;`
        }
      ]
    },
    {
      name: "server.js",
      path: "server.js",
      type: "file",
      description: "Applet network entry-point. Resolves DB handshakes, triggers Express HTTP protocol bindings and listens on server sockets.",
      imports: ["express", "dotenv", "connectDB", "colors"],
      technologies: ["Node.js Core", "TCP Socket Bounds"],
      blueprintCode: `import app from './app.js';
import connectDB from './config/db.js';
import colors from 'colors';

// Establish connection pools
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(\`
===================================================
      ⚡ ROY MEN BACKEND SYSTEM OPERATIVE ⚡
===================================================
  [ENV] Mode:      \${process.env.NODE_ENV || 'development'}
  [SVC] Node Port:  \${PORT}
  [URL] Base Hook: http://localhost:\${PORT}
===================================================\`.gold.bold);
});

// Configure robust system shutdown handlers
process.on('unhandledRejection', (err, promise) => {
  console.error(\`[FATAL] Unhandled Rejection: \${err.message}\`.red.bold);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.warn('[SVC] SIGTERM received. Gracefully closing Express server connection queue...'.yellow);
  server.close(() => {
    console.log('[SVC] Express sockets empty. System terminated safely.'.green);
    process.exit(0);
  });
});`
    },
    {
      name: "app.js",
      path: "app.js",
      type: "file",
      description: "Registers Express services, enforces CORS rules and mounts security controllers and routing pipelines.",
      imports: ["express", "cors", "helmet", "rateLimiter"],
      technologies: ["Express", "Helmet (Security)", "CORS Headers"],
      blueprintCode: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

// Route targets
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Exceptions middleware
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const app = express();

// 1. Mount Security Handlers
app.use(helmet()); // Set headers to prevent Clickjacking, sniffing or cross-scripts injections
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Basic rate limiting (to protect OTP vectors)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minute lock window
  max: 10, // Max 10 attempts per IP block
  message: { success: false, message: 'Too many OTP security requests from this device. Please retry in 15 minutes.' }
});

app.use(express.json({ limit: '10mb' })); // Allow medium JSON schemas for image arrays
app.use(express.urlencoded({ extended: true }));

// Express DB query injection sanitizers
app.use(mongoSanitize());
// HTTP Parameter Pollution protect
app.use(hpp());

// 2. Map Service Vectors
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);

// Base validation endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, status: 'Alive', timestamp: new Date() });
});

// 3. Fallback handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;`
    }
  ]
};

export const MONGOOSE_SCHEMAS: MongooseModel[] = [
  {
    name: "User Module Schema",
    description: "Supports role attributes for RBAC control and profile details for checkout fields.",
    fields: [
      { name: "email", type: "String", required: true, unique: true, description: "Normalized user authorization handle, enforced lower-case with email regex constraints" },
      { name: "name", type: "String", required: true, description: "Customer's official display name" },
      { name: "phone", type: "String", required: false, description: "User's verified mobile number for cash on delivery updates" },
      { name: "role", type: "String", required: true, default: "customer", description: "Supports ['customer', 'admin'] values to filter backend access levels" },
      { name: "shippingAddress", type: "SubDocument", required: false, description: "Embedded sub-document storing street, city, district, postalCode and country profile" }
    ],
    indexes: ["email: 1 (Unique index for high-speed authentication check)", "email: 1, role: 1 (Compound query optimization)"],
    middlewares: ["pre-save: Validates and capitalizes postal codes if supplied"]
  },
  {
    name: "Product Collection Schema",
    description: "Configures pricing schemes, nested arrays representing sizes/stocks, and Cloudinary public secure url maps.",
    fields: [
      { name: "title", type: "String", required: true, description: "Design display name. Limits: Max 120 characters" },
      { name: "slug", type: "String", required: true, unique: true, description: "SEO friendly url identifier created automatically during database pre-save" },
      { name: "description", type: "String", required: true, description: "Rich details representing fabric, weight, stitching and size fit specs" },
      { name: "price", type: "Number", required: true, description: "Base retail price specified in BDT (Bangladeshi Taka)" },
      { name: "discountPrice", type: "Number", required: false, description: "Active campaign sale evaluation, validated to sit below the standard retail price value" },
      { name: "category", type: "ObjectId (Ref: Category)", required: true, description: "Dynamic reference linking the item to its designated catalog grouping" },
      { name: "subCategory", type: "String (Enum)", required: true, description: "Specifies style types: ['unstitched', 'panjabi', 'shirt', 'polo', 'tshirt', 'chino', 'denim', 'blazer']" },
      { name: "sizes", type: "Array (Subdocs)", required: true, description: "Includes [{size: 'M', stock: 12}] elements with discrete inventories" },
      { name: "images", type: "Array (Subdocs)", required: true, description: "Holds [{secureUrl: String, publicId: String}] coordinates from Cloudinary" }
    ],
    indexes: ["title: 'text', description: 'text', subCategory: 'text' (Standard Full-text Indexing for dynamic searches)", "price: 1, category: 1 (Filter index mapping)"],
    middlewares: ["pre-save: Auto-creates a clean SEO-friendly slug from title before record storage"]
  },
  {
    name: "Order Invoice Schema",
    description: "Preserves cart coordinates, stores shipping destination profiles, and supports COD or bKash/Nagad digital receipts.",
    fields: [
      { name: "user", type: "ObjectId (Ref: User)", required: true, description: "Binds the transaction record securely to a customer profile" },
      { name: "orderItems", type: "Array (Inlined)", required: true, description: "Preserves snapshots of [{product, title, size, quantity, price}] items" },
      { name: "shippingDetails", type: "SubDocument", required: true, description: "Captures custom name, phone, street, city, and district at time of checkout" },
      { name: "paymentMethod", type: "String (Enum)", required: true, description: "Specifies standard payment channels: ['COD', 'bKash', 'Nagad']" },
      { name: "paymentStatus", type: "String (Enum)", required: true, default: "Pending", description: "Binds ['Pending', 'Submitted', 'Verified', 'Failed'] status matrix" },
      { name: "manualPaymentDetails", type: "SubDocument", required: false, description: "Aggregates optional digital credentials: {senderNumber, transactionId, amountPaid}" },
      { name: "totalPrice", type: "Number", required: true, description: "Total checkout cost excluding delivery fees" },
      { name: "shippingPrice", type: "Number", required: true, default: "120", description: "Assigned Bangladeshi courier fees (e.g. 120 BDT, customisable)" },
      { name: "orderStatus", type: "String (Enum)", required: true, default: "Placed", description: "Fulfillment coordinates tracker: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']" }
    ],
    indexes: ["user: 1, orderStatus: 1 (Optimizes dashboard profiles requests)", "createdAt: -1 (Aggregates newest histories)"],
    middlewares: ["pre-save: Double-checks currency total values match absolute pricing tallies", "post-save: Triggers status change alerts via socket stream protocols if enabled"]
  }
];

export const API_ROUTES_PLAYBOOK: ApiRoute[] = [
  {
    category: "Authentication Services",
    method: "POST",
    path: "/api/v1/auth/otp/send",
    description: "Generates a transient 6-digit numeric OTP, stores it in an Otp model, and sends an HTML email via SMTP nodemailer relay.",
    requiresAuth: "Guest",
    headers: { "Content-Type": "application/json" },
    requestBody: JSON.stringify({ email: "mrinal2192@gmail.com", purpose: "registration" }, null, 2),
    responseSuccess: JSON.stringify({
      success: true,
      message: "Temporary verification security code successfully dispatched to mrinal2192@gmail.com."
    }, null, 2),
    simulatedQueryLogs: [
      "DB query: Otp.findOneAndDelete({ email: 'mrinal2192@gmail.com', purpose: 'registration' })",
      "SMTP Handshake: Establishing pooled secure TLS relay connection via SMTP node...",
      "DB query: Otp.create({ email: 'mrinal2192@gmail.com', otpCode: '492815' })",
      "EMAIL RELAY: Secured OTP email envelope transmitted to 'mrinal2192@gmail.com'."
    ]
  },
  {
    category: "Authentication Services",
    method: "POST",
    path: "/api/v1/auth/otp/verify",
    description: "Validates verification codes. Deletes the OTP model immediately on success to prevent reuse risk, and returns a 30-day signed JWT.",
    requiresAuth: "Guest",
    headers: { "Content-Type": "application/json" },
    requestBody: JSON.stringify({ email: "mrinal2192@gmail.com", otpCode: "492815", purpose: "registration", name: "Mrinal", phone: "01712345678" }, null, 2),
    responseSuccess: JSON.stringify({
      success: true,
      message: "Email successfully verified, secure session signed.",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MmUxOTMyZmQiLCJpYXQiOjE3MTg3MjgwMDB9...",
      user: {
        id: "642e1932fd1a",
        name: "Mrinal",
        email: "mrinal2192@gmail.com",
        role: "customer",
        shippingAddress: { country: "Bangladesh" }
      }
    }, null, 2),
    simulatedQueryLogs: [
      "DB query: Otp.findOne({ email: 'mrinal2192@gmail.com', otpCode: '492815', purpose: 'registration' }) -> Match Found",
      "DB query: Otp.deleteOne({ _id: '64c91a78' }) -> Target code successfully spent",
      "DB query: User.findOne({ email: 'mrinal2192@gmail.com' }) -> Not Found (Initializing provision)",
      "DB query: User.create({ email: 'mrinal2192@gmail.com', name: 'Mrinal', phone: '01712345678', role: 'customer' })",
      "JWT SERVICE: Crypto-signing user payload securely with HS256 algorithm and 30-day lifetime."
    ]
  },
  {
    category: "Product Management (Open)",
    method: "GET",
    path: "/api/v1/products",
    description: "Queries products collection dynamically. Integrates regex-based text sorting, sub-category limits and size parameters.",
    requiresAuth: "Guest",
    headers: { "Content-Type": "application/json" },
    queryParams: [
      { name: "search", type: "String", required: false, description: "Full-text search keywords (e.g. 'Panjabi')" },
      { name: "subCategory", type: "String", required: false, description: "Garment family limits ('shirts', 'polo')" },
      { name: "size", type: "String", required: false, description: "Garment size ('S', 'M', 'L', 'XL')" },
      { name: "minPrice", type: "Number", required: false, description: "Lower-bound filters in BDT" },
      { name: "maxPrice", type: "Number", required: false, description: "Upper-bound filters in BDT" },
      { name: "sort", type: "String", required: false, description: "Sorting choices: 'price-low' | 'price-high' | 'newest'" }
    ],
    responseSuccess: JSON.stringify({
      success: true,
      count: 2,
      totalPages: 1,
      currentPage: 1,
      totalRecords: 2,
      products: [
        {
          _id: "65f2a1b9",
          title: "Premium Royal Blue Panjabi",
          slug: "premium-royal-blue-panjabi",
          description: "Cut from ultra-premium organic cotton, featuring refined intricate collar details tailored for ROY MEN customers.",
          price: 3450,
          category: { _id: "65f0a0", name: "Traditional Wear" },
          subCategory: "panjabi",
          sizes: [
            { size: "M", stock: 15 },
            { size: "L", stock: 22 }
          ],
          images: [{ secureUrl: "https://res.cloudinary.com/roymen/image/upload/v1/p1.webp", publicId: "roymen/p1" }]
        }
      ]
    }, null, 2),
    simulatedQueryLogs: [
      "DB query: Product.find({ subCategory: 'panjabi', 'sizes.size': 'L' })",
      "POPULATE: Joint query trigger Category table where id IS '65f0a0'",
      "COUNT: Product.countDocuments(query) -> Returns records count",
      "OUTPUT: Formatting items pagination payload cleanly."
    ]
  },
  {
    category: "Order Management (Secured)",
    method: "POST",
    path: "/api/v1/orders",
    description: "Fills checkout invoice details. Calculates aggregate items pricing, updates related product item stocks via Mongoose bulkWrite, and registers pending transaction tracking documents.",
    requiresAuth: "User",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer eyJhbGcio..." },
    requestBody: JSON.stringify({
      orderItems: [
        { product: "65f2a1b9", title: "Premium Royal Blue Panjabi", size: "L", quantity: 1, price: 3450 }
      ],
      shippingDetails: {
        name: "Mrinal Bhuiyan",
        phone: "01712345678",
        street: "Road 12, Dhanmondi",
        city: "Dhaka",
        district: "Dhaka",
        postalCode: "1209"
      },
      paymentMethod: "bKash",
      manualPaymentDetails: {
        senderNumber: "01712345678",
        transactionId: "BKX9284D72"
      }
    }, null, 2),
    responseSuccess: JSON.stringify({
      success: true,
      message: "Order created. Payment verification initialized and garment inventory allocated.",
      order: {
        _id: "65f3f1e2",
        user: "642e1932fd1a",
        totalPrice: 3450,
        shippingPrice: 120,
        paymentMethod: "bKash",
        paymentStatus: "Submitted",
        orderStatus: "Placed",
        manualPaymentDetails: {
          senderNumber: "01712345678",
          transactionId: "BKX9284D72",
          amountPaid: 3570
        }
      }
    }, null, 2),
    simulatedQueryLogs: [
      "AUTH CHECK: Verified bearer trace, matched registered User profile '642e1932fd1a'.",
      "DB query: Product.findById('65f2a1b9') -> Product valid and available.",
      "INVENTORY DECREMENT: Preparing bulk update operation queue schema in memory...",
      "DB query: Product.bulkWrite([ { updateOne: { filter: { _id: '65f2a1b9', 'sizes.size': 'L' }, update: { $inc: { 'sizes.$.stock': -1 } } } } ])",
      "DB query: Order.create({ user: '642e1932fd1a', totalPrice: 3450, paymentStatus: 'Submitted', manualPaymentDetails: { ... } })"
    ]
  },
  {
    category: "Admin Portal Matrix",
    method: "GET",
    path: "/api/v1/analytics/dashboard",
    description: "Computes system metrics totals. Evaluates pipeline totals, and aggregates daily income streams over time.",
    requiresAuth: "Admin",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer eyJhbGcio..." },
    responseSuccess: JSON.stringify({
      success: true,
      metrics: {
        totalRevenue: 342500,
        customerCount: 1420,
        outstandingOrdersCount: 24,
        productCatalogCount: 189
      },
      charts: {
        dailyRevenue: [
          { _id: "2026-06-12", revenue: 42000, orderCount: 12 },
          { _id: "2026-06-13", revenue: 58500, orderCount: 18 },
          { _id: "2026-06-14", revenue: 31000, orderCount: 9 },
          { _id: "2026-06-15", revenue: 89000, orderCount: 27 },
          { _id: "2026-06-16", revenue: 64000, orderCount: 16 }
        ],
        paymentDistribution: [
          { _id: "COD", value: 68 },
          { _id: "bKash", value: 242 },
          { _id: "Nagad", value: 110 }
        ]
      }
    }, null, 2),
    simulatedQueryLogs: [
      "AUTH CHECK: JWT Verified. Match Admin role clearance confirmed (Access Approved).",
      "DB PIPELINE: Order.aggregate([ { $match: { orderStatus: 'Delivered' } }, { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } } ])",
      "DB count: User.countDocuments({ role: 'customer' })",
      "DB count: Order.countDocuments({ orderStatus: { $ne: 'Delivered' } })",
      "DB PIPELINE: Order.aggregate([ { $match: { createdAt: { $gte: startRange }, orderStatus: 'Delivered' } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orderCount: { $sum: 1 } } } ])"
    ]
  }
];

export const GENERAL_ENV_VARIABLES = `
# ===================================================================
# ROY MEN - PRODUCTION API SETTINGS (RAILWAY & NETLIFY HOOKS)
# ===================================================================

# Server Deployment Profile
NODE_ENV="production"
PORT=3000
CLIENT_ORIGIN="https://roymen-shop.netlify.app"

# Mongo Atlas Relational Connection Pool
# Connect to your server cluster. Keep passwords properly secured.
MONGO_URI="mongodb+srv://admin_roy_men:W4ar_Confid4nce_2026@roymen-cluster.mgy8x.mongodb.net/roymen_production?retryWrites=true&w=majority"

# JSON Web Token Secret Signatures
# Generate long cryptographic keys for secure signing pipelines.
JWT_SECRET="8a7b9fc23e20e8d3568858e3707c74dbdeca64dcdcb2b54bc95fbd7e478546bcee38ca1568ae98"
JWT_LIFETIME="30d"

# Cloudinary Dynamic Picture CDN API integration
# Locate these credentials inside your Cloudinary Dashboard under Settings.
CLOUDINARY_CLOUD_NAME="roy-men-bangladesh"
CLOUDINARY_API_KEY="828192842918294"
CLOUDINARY_API_SECRET="t6u-G897d2bA97fdKJD26GfBdaN"

# Nodemailer SSL / TLS SMTP Relaying Engine
# Configure these details with your business domain email provider keys.
SMTP_HOST="mail.roymen.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="security@roymen.com"
SMTP_PASS="p@ss_Wear_Conf_Sec_2026"
`;

export const SECURITY_MIDDLEWARE_CHECKLIST = [
  {
    library: "helmet()",
    purpose: "HTTP Header Security Defender",
    status: "Production Ready",
    details: "Enforces crucial protection headers to block Clickjacking payloads, prevent MIME sniffing, disable X-Powered-By banners and restrict cross-site policy leaks.",
    code: "import helmet from 'helmet';\napp.use(helmet());"
  },
  {
    library: "cors()",
    purpose: "Cross-Origin Resource Validation",
    status: "Domain Locked",
    details: "Restricts API route hooks. Explicitly defines allowed origins (e.g. Netlify deployment URL), validates request methods (POST, GET, PUT), and safely handles digital cookie keys.",
    code: "import cors from 'cors';\napp.use(cors({\n  origin: process.env.CLIENT_ORIGIN,\n  credentials: true\n}));"
  },
  {
    library: "express-rate-limit",
    purpose: "DDoS & Brute-Force Rate Limiter",
    status: "Highly Active",
    details: "Limits resource abuse. Throttles user IP sockets to prevent brute-force OTP attempts. Enforces maximum 10 requests per 15 minutes over verification APIs.",
    code: "import rateLimit from 'express-rate-limit';\nconst authLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000,\n  max: 10\n});\napp.use('/api/v1/auth', authLimiter);"
  },
  {
    library: "express-mongo-sanitize",
    purpose: "Database Injection Sanitizer",
    status: "Production Ready",
    details: "Actively sweeps incoming request payloads. Strip any nested commands carrying dollar ($) characters or full-stops (.) to block query selector injections.",
    code: "import mongoSanitize from 'express-mongo-sanitize';\napp.use(mongoSanitize());"
  },
  {
    library: "hpp()",
    purpose: "HTTP Parameter Pollution Buffer",
    status: "Production Ready",
    details: "Safeguards multi-parameter product sorting arrays, flattening array query properties to single variables to block payload parameter pollution attacks.",
    code: "import hpp from 'hpp';\napp.use(hpp());"
  }
];

export const COMPILATION_SCRIPTS = {
  "package.json": `{
  "name": "roy-men-backend",
  "version": "1.0.0",
  "description": "Premium E-Commerce Backend System for ROY MEN Bangladesh",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node scripts/seedProducts.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.0.1",
    "colors": "^1.4.0",
    "cors": "^2.8.5",
    "dotenv": "^17.0.0",
    "express": "^4.18.3",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "hpp": "^0.2.3",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.2.1",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.11"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}`
};

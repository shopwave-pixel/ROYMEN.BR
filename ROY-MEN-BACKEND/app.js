import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

// Route targets
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Exceptions middleware fallback bounds
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const app = express();

// 1. Mount Security Handlers
app.use(helmet()); // Enforce protection headers (prevents Hijacking, MIMEs sniffing)
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Basic rate limiting (to protect OTP registers vectors)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minute lock window duration
  max: 10, // Max 10 attempts per IP socket block
  message: { success: false, message: 'Too many OTP attempts from this device. Please retry in 15 minutes.' }
});

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true }));

// Express DB query injection sanitizers
app.use(mongoSanitize());
// HTTP Parameter Pollution protect
app.use(hpp());

// 2. Map Service Vectors
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Base validation state endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, status: 'Alive', timestamp: new Date() });
});

export default app;

import express from 'express';
import {
  getDashboardOverview,
  getRevenueStats,
  getOrderStats,
  getCustomerStats,
  getProductStats
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All analytics route pathways are restricted strictly to Authenticated Admin Accounts
 */
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardOverview);
router.get('/revenue', getRevenueStats);
router.get('/orders', getOrderStats);
router.get('/customers', getCustomerStats);
router.get('/products', getProductStats);

export default router;

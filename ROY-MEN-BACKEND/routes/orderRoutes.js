import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrdersAdmin,
  cancelOrder,
  updateOrderStatusAdmin
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All Order routing vectors are strictly session-bound JWT protected
 */
router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/admin', authorize('admin'), getAllOrdersAdmin);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', authorize('admin'), updateOrderStatusAdmin);

export default router;

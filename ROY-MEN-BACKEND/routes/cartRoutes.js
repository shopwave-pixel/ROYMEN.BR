import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All cart endpoints require secure authorization tokens
 */
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/remove', removeFromCart);
router.put('/update', updateCartItemQuantity);
router.delete('/', clearCart);

export default router;

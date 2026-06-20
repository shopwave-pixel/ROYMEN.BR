import express from 'express';
import {
  getPaymentDetails,
  submitTransactionId,
  updatePaymentStatusAdmin
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All active Payment vectors are strictly protected by session JWT guarantees
 */
router.use(protect);

router.get('/:id', getPaymentDetails);
router.put('/:id/submit-txid', submitTransactionId);
router.put('/:id/verify', authorize('admin'), updatePaymentStatusAdmin);

export default router;

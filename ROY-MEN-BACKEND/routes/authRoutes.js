import express from 'express';
import { requestOtp, verifyOtpAndLogin, getUserProfile } from '../controllers/authController.js';
import { validateRequestOtp, validateVerifyOtp } from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes with robust input schemas validation checking
router.post('/otp/send', validateRequestOtp, requestOtp);
router.post('/otp/verify', validateVerifyOtp, verifyOtpAndLogin);

// Protected routes requiring header Bearer signatures checks
router.get('/profile', protect, getUserProfile);

export default router;

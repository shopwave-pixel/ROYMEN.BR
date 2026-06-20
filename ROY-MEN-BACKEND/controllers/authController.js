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
    const { email, purpose } = req.body; 

    // Spawn 6-Digit random integer OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store secure short-term record
    await Otp.findOneAndDelete({ email, purpose }); // Clear stale records for this session path
    await Otp.create({ email, otpCode, purpose });

    // Send via Nodemailer SMTP transporter service
    await sendOTPEmail(email, otpCode);

    res.status(200).json({
      success: true,
      message: `Temporary verification security code successfully dispatched to ${email}.`
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

    // Verify code existence
    const verifiedOtp = await Otp.findOne({ email, otpCode, purpose });
    if (!verifiedOtp) {
      res.status(401);
      throw new Error('The activation OTP supplied is invalid or expired.');
    }

    // Garbage-collect verified code immediately (strict one-time-use constraint)
    await Otp.deleteOne({ _id: verifiedOtp._id });

    // Find or Provision Customer Profile
    let user = await User.findOne({ email });

    if (!user) {
      if (purpose === 'registration') {
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

    // Issue Secure 30-Day Session Token
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
};

/**
 * @desc    Fetch active session user profiles
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        shippingAddress: req.user.shippingAddress
      }
    });
  } catch (error) {
    next(error);
  }
};

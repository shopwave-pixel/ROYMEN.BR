import mongoose from 'mongoose';

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

export default mongoose.model('Otp', OtpSchema);

/**
 * Custom Input Validation Middleware for ROY MEN Auth API Endpoints
 */

/**
 * Validates standard request OTP payloads
 */
export const validateRequestOtp = (req, res, next) => {
  const { email, purpose } = req.body;

  if (!email) {
    res.status(400);
    return next(new Error('Email address is mandatory.'));
  }

  // Basic email pattern check
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    return next(new Error('Please supply a standard, syntactically valid active email.'));
  }

  if (!purpose || !['registration', 'login'].includes(purpose)) {
    res.status(400);
    return next(new Error('Purpose parameter must reside inside ["registration", "login"].'));
  }

  next();
};

/**
 * Validates verify OTP payloads
 */
export const validateVerifyOtp = (req, res, next) => {
  const { email, otpCode, purpose, name } = req.body;

  if (!email || !otpCode || !purpose) {
    res.status(400);
    return next(new Error('Mandatory credit details (email, otpCode, purpose) are absent.'));
  }

  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otpCode)) {
    res.status(400);
    return next(new Error('Invalid code layout. The OTP must represent a 6-digit numeric string.'));
  }

  // Registration requires display name check
  if (purpose === 'registration' && !name) {
    res.status(400);
    return next(new Error('Initial registration profiles require a Display Name.'));
  }

  next();
};

export default {
  validateRequestOtp,
  validateVerifyOtp
};

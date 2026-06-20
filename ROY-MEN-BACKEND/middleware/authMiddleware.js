import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect pipeline middleware to verify JWT signatures
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode validation signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Mutate Request pipeline to inject verified User structure (bypass heavy DB read when possible)
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        res.status(401);
        throw new Error('User matching token signature no longer exists.');
      }

      if (!req.user.isActive) {
        res.status(403);
        throw new Error('Your ROY MEN access has been administratively deactivated.');
      }

      next();
    } catch (error) {
      console.error('[AUTH] Token verification failure:', error.message);
      res.status(401);
      next(new Error('Authorization rejected, signature expired or invalid.'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('No bearer authorization token supplied.'));
  }
};

/**
 * Role-Based Access Control Filtering
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Operation Forbidden: Requester role '${req.user ? req.user.role : 'Guest'}' lacks administrative clearance.`));
    }
    next();
  };
};

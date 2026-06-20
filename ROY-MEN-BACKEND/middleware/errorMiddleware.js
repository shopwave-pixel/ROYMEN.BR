/**
 * Custom 404 Route Fallback
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Unified Global Server Exception Parser
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Custom Mongoose bad ObjectId mapping
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource reference identifier not found (Malformed ObjectId)';
  }

  // Custom Mongo duplicate key handling
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field entry recorded. The value supplied for resource '${field}' already exists.`;
  }

  // Custom validation failure formatting
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  console.error(`[ERROR_PIPELINE] ${req.method} ${req.url} - Error:`, err);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? '🔒' : err.stack
  });
};

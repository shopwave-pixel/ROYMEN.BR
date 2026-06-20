import app from './app.js';
import connectDB from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

// Establish connection pools
connectDB();

// 3. Mount Backend Fallback handlers downstream
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
===================================================
      ⚡ ROY MEN BACKEND SYSTEM OPERATIVE ⚡
===================================================
  [ENV] Mode:       ${process.env.NODE_ENV || 'development'}
  [SVC] Node Port:  ${PORT}
  [URL] Base Hook:  http://localhost:${PORT}
===================================================`);
});

// Configure robust system shutdown handlers
process.on('unhandledRejection', (err, promise) => {
  console.error(`[FATAL] Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.warn('[SVC] SIGTERM received. Gracefully closing Express server connection queue...');
  server.close(() => {
    console.log('[SVC] Express sockets empty. System terminated safely.');
    process.exit(0);
  });
});

import dotenv from 'dotenv';
// 1. Load env variables from root and backend
dotenv.config();
dotenv.config({ path: './ROY-MEN-BACKEND/.env' });

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// @ts-ignore
import app from './ROY-MEN-BACKEND/app.js';
// @ts-ignore
import connectDB from './ROY-MEN-BACKEND/config/db.js';
// @ts-ignore
import { errorHandler, notFoundHandler } from './ROY-MEN-BACKEND/middleware/errorMiddleware.js';

const PORT = 3000;

async function startServer() {
  console.log('[SERVER_START] Initializing ROY MEN Full-Stack Service...');

  // 2. Connect to database gracefully
  try {
    await connectDB();
  } catch (err: any) {
    console.error('[SERVER_START] Database connection failed or credentials missed:', err.message);
  }

  const distPath = path.join(process.cwd(), 'dist');
  const hasBuild = fs.existsSync(path.join(distPath, 'index.html'));

  // Force Vite middleware if running inside the AI Studio live workspace dev environment
  // or if the production built folders are missing, ensuring live hot-reloading code previews.
  const isDev = process.env.NODE_ENV !== 'production' || !hasBuild;

  // 3. Mount Vite middleware for development or Serve static directory in production
  if (isDev) {
    console.log('[SERVER_START] Integrating local dev compiler as a middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production assets from the standard built folder
    console.log('[SERVER_START] Deploying static asset routers in production...');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 3.5 Mount fallback handlers at the EXTREME Downstream so they don't block static/frontend resources
  app.use(notFoundHandler);
  app.use(errorHandler);

  // 4. Bind and listen on port 3000 (standard accessible container port)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
===================================================
      ⚡ ROY MEN FULL-STACK RAMPED & ACTIVE ⚡
===================================================
  [ENV] Node Env:   ${process.env.NODE_ENV || 'development'}
  [SVC] Local Port: ${PORT}
  [URL] Base Hook:  http://localhost:${PORT}
===================================================`);
  });
}

startServer();

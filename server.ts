import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { apiRouter } from './server/routes.js';

async function startServer() {
  const app = express();
  app.set('trust proxy', 1); // Trust the first proxy (e.g. load balancer) for accurate IP rate limiting

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parsing for JSON and urlencoded payloads (support image data URLs)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Global HTTP Security Headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // In production, lock down framing to prevent clickjacking.
    // In development, allow AI Studio origins for previewing.
    if (isProd) {
      res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    } else {
      res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://*.google.com https://*.googleusercontent.com");
    }
    next();
  });

  // Security Firewall: strictly block direct HTTP access to internal server files and database files
  app.use((req, res, next) => {
    const raw = decodeURIComponent(req.path).toLowerCase();
    // Always allow frontend assets, Vite internals, and public API
    if (
      raw.startsWith('/api') ||
      raw.startsWith('/src') ||
      raw.startsWith('/@') ||
      raw.startsWith('/node_modules')
    ) {
      return next();
    }
    // Block direct access to database directory, server source code, and environment vars
    if (
      raw === '/server.ts' ||
      raw.startsWith('/data/') ||
      raw.startsWith('/server/') ||
      raw.startsWith('/.env') ||
      raw === '/data' ||
      raw === '/server'
    ) {
      return res.status(403).json({ error: 'Access Denied: Direct access to server internal files is forbidden' });
    }
    next();
  });

  // API router mounted under /api

  // API router mounted under /api
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  if (!isProd) {
    // Development mode: attach Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

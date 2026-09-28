import 'dotenv/config';
import express from 'express';
import { apiRouter } from '../server/routes.js';

const app = express();
app.set('trust proxy', 1);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Mount on both /api and root so both Vercel rewrites and direct calls succeed
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;

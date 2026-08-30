import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: true, // Reflect request origin to support localhost:5173, localhost:3000, etc.
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-id', 'x-idempotency-key'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// API v1 Master Router
app.use('/api/v1', apiRouter);

// Serve Frontend build if present in production or standalone
const candidateFrontendPaths = [
  path.resolve(__dirname, '../../../Frontend/dist/public'),
  path.resolve(__dirname, '../../../Frontend/dist'),
  path.resolve(process.cwd(), 'Frontend/dist/public'),
  path.resolve(process.cwd(), 'Frontend/dist'),
  path.resolve(process.cwd(), 'dist/public'),
];

const staticFrontendDir = candidateFrontendPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (staticFrontendDir) {
  app.use(express.static(staticFrontendDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticFrontendDir, 'index.html'));
  });
}

// 404 Fallback for API
app.use((req, res) => {
  res.status(404).json({
    data: null,
    meta: { timestamp: new Date().toISOString() },
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.url} not found` }
  });
});

// Global Error Handler
app.use(errorHandler);

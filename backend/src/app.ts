import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiRouter } from './routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// API v1 Master Router
app.use('/api/v1', apiRouter);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    data: null,
    meta: { timestamp: new Date().toISOString() },
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.url} not found` }
  });
});

// Global Error Handler
app.use(errorHandler);

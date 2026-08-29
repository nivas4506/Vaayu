import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Error Handler]', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      data: null,
      meta: { timestamp: new Date().toISOString() },
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload or parameters',
        details: err.errors
      }
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    data: null,
    meta: { timestamp: new Date().toISOString() },
    error: {
      code: err.code || 'SERVER_ERROR',
      message: message
    }
  });
}

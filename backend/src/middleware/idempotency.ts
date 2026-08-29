import { Request, Response, NextFunction } from 'express';

const processedKeys = new Map<string, { statusCode: number; body: any }>();

export function idempotency(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-idempotency-key'] as string;
  if (!key) return next();

  if (processedKeys.has(key)) {
    const cached = processedKeys.get(key)!;
    return res.status(cached.statusCode).json(cached.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    processedKeys.set(key, { statusCode: res.statusCode, body });
    return originalJson(body);
  };

  next();
}

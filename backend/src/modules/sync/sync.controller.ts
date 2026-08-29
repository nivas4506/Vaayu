import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { processBatchSync } from './sync.service.js';

const syncBatchSchema = z.object({
  items: z.array(z.object({
    idempotencyKey: z.string().optional(),
    type: z.enum(['feedback', 'referral', 'status_update']),
    payload: z.any()
  }))
});

export function processBatchSyncController(req: Request, res: Response, next: NextFunction) {
  try {
    const body = syncBatchSchema.parse(req.body);
    const syncReport = processBatchSync(
      body.items,
      (req as any).userId,
      (req as any).userRole
    );

    return res.status(200).json({
      data: syncReport,
      meta: { timestamp: new Date().toISOString() },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

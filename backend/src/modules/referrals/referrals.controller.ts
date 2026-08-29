import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createReferral, getReferralByCode, updateReferralStatus } from './referrals.service.js';

const createReferralSchema = z.object({
  originFacilityId: z.string().min(1),
  destFacilityId: z.string().min(1),
  serviceId: z.string().min(1),
  patientName: z.string().min(1),
  patientPhone: z.string().min(1),
  urgency: z.enum(['ROUTINE', 'URGENT']),
  notes: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['CREATED', 'ACCEPTED', 'READY_FOR_VISIT', 'COMPLETED', 'REJECTED', 'REDIRECTED']),
  reason: z.string().optional()
});

export function createReferralController(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createReferralSchema.parse(req.body);
    const referral = createReferral({
      ...body,
      actorId: (req as any).userId
    });

    return res.status(201).json({
      data: referral,
      meta: { timestamp: new Date().toISOString() },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export function getReferralController(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.params;
    const referral = getReferralByCode(code);

    if (!referral) {
      return res.status(404).json({
        data: null,
        meta: { timestamp: new Date().toISOString() },
        error: { code: 'NOT_FOUND', message: `Referral with code ${code} not found` }
      });
    }

    return res.json({
      data: referral,
      meta: { timestamp: new Date().toISOString() },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export function updateReferralStatusController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = updateStatusSchema.parse(req.body);

    const updated = updateReferralStatus(id, body.status, {
      reason: body.reason,
      actorId: (req as any).userId
    });

    return res.json({
      data: updated,
      meta: { timestamp: new Date().toISOString() },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

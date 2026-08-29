import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { submitAvailabilityUpdate } from './availability.service.js';

const updateAvailabilitySchema = z.object({
  facilityId: z.string().min(1),
  serviceId: z.string().min(1),
  status: z.enum(['AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'UNKNOWN']),
  source: z.enum(['FACILITY_REPORTED', 'ASHA_REPORTED', 'PATIENT_FEEDBACK']).default('FACILITY_REPORTED'),
  capacityNote: z.string().optional()
});

export function submitAvailabilityController(req: Request, res: Response, next: NextFunction) {
  try {
    const body = updateAvailabilitySchema.parse(req.body);
    const updated = submitAvailabilityUpdate({
      ...body,
      updatedBy: (req as any).userId
    });

    return res.status(200).json({
      data: updated,
      meta: { timestamp: new Date().toISOString() },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

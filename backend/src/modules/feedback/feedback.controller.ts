import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { submitFeedback, getAllFeedbackReports } from './feedback.service.js';

const feedbackSchema = z.object({
  facilityId: z.string().min(1),
  serviceId: z.string().optional(),
  category: z.enum(['wrong_status', 'wrong_hours', 'missing_facility', 'medicine_shortage', 'staff_absent']),
  description: z.string().min(3)
});

export function submitFeedbackController(req: Request, res: Response, next: NextFunction) {
  try {
    const body = feedbackSchema.parse(req.body);
    const feedback = submitFeedback({
      ...body,
      reporterRole: (req as any).userRole || 'PATIENT'
    });

    return res.status(201).json({
      data: feedback,
      meta: { timestamp: new Date().toISOString() },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export function listFeedbackController(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as 'PENDING' | 'RESOLVED' | undefined;
    const reports = getAllFeedbackReports(status);

    return res.json({
      data: reports,
      meta: { total: reports.length, timestamp: new Date().toISOString() },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

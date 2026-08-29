import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../middleware/rbac.js';
import { triggerSos, getSosStatus } from './sos.service.js';

const sosTriggerSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export function submitSosController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = sosTriggerSchema.parse(req.body);
    const sosRecord = triggerSos({
      reporterId: req.userId || 'anon_patient',
      reporterRole: req.userRole || 'PATIENT',
      latitude: body.latitude,
      longitude: body.longitude
    });

    res.status(201).json({
      data: sosRecord,
      meta: {
        timestamp: new Date().toISOString()
      },
      error: null
    });
  } catch (error) {
    next(error);
  }
}

export function getSosStatusController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const sosRecord = getSosStatus(id);

    if (!sosRecord) {
      return res.status(404).json({
        data: null,
        meta: { timestamp: new Date().toISOString() },
        error: {
          code: 'NOT_FOUND',
          message: `SOS trigger record with ID ${id} not found`
        }
      });
    }

    res.json({
      data: sosRecord,
      meta: {
        timestamp: new Date().toISOString()
      },
      error: null
    });
  } catch (error) {
    next(error);
  }
}

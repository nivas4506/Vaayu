import { Request, Response, NextFunction } from 'express';
import { discoverFacilities } from './discovery.service.js';

export function discoverFacilitiesController(req: Request, res: Response, next: NextFunction) {
  try {
    const need = (req.query.need as string) || 'consultation';
    const pincode = req.query.pincode as string | undefined;
    const village = req.query.village as string | undefined;
    const userLat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const userLng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

    const discoveryData = discoverFacilities({ need, pincode, village, userLat, userLng });

    return res.json({
      data: discoveryData,
      meta: {
        freshnessWindowHours: 48,
        timestamp: new Date().toISOString()
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

import { Request, Response, NextFunction } from 'express';
import { getAllFacilities, getFacilityById } from './facilities.service.js';
import { db } from '../../db/client.js';

export async function listFacilitiesController(req: Request, res: Response, next: NextFunction) {
  try {
    const type = req.query.type as string | undefined;
    const pincode = req.query.pincode as string | undefined;

    const facilities = await getAllFacilities({ type, pincode });

    return res.json({
      data: facilities,
      meta: {
        total: facilities.length,
        timestamp: new Date().toISOString()
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getFacilityController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const facility = await getFacilityById(id);

    if (!facility) {
      return res.status(404).json({
        data: null,
        meta: { timestamp: new Date().toISOString() },
        error: { code: 'NOT_FOUND', message: `Facility with ID ${id} not found` }
      });
    }

    return res.json({
      data: facility,
      meta: { timestamp: new Date().toISOString() },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export function listServicesTaxonomyController(req: Request, res: Response, next: NextFunction) {
  try {
    const services = db.prepare(`SELECT * FROM services WHERE active = true ORDER BY category, id`).all();
    return res.json({
      data: services,
      meta: { total: services.length, timestamp: new Date().toISOString() },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

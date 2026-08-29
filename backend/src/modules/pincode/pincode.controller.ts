import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { lookupIndiaPincode } from './pincode.service.js';

const pincodeParamSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'PIN code must be a valid 6-digit Indian postal code')
});

export async function lookupPincodeController(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = pincodeParamSchema.parse(req.params);
    const result = await lookupIndiaPincode(code);

    res.json({
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        source: result.source
      },
      error: null
    });
  } catch (error) {
    next(error);
  }
}

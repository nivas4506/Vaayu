import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendOtp, verifyOtp } from './auth.service.js';

const sendOtpSchema = z.object({
  phone: z.string().min(5, 'Phone number is required'),
  channel: z.enum(['sms', 'voice', 'whatsapp']).optional().default('sms'),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(5, 'Phone number is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function sendOtpController(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, channel } = sendOtpSchema.parse(req.body);
    const result = await sendOtp({ phone, channel });
    return res.status(200).json({
      data: result,
      meta: { timestamp: new Date().toISOString() },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

export function verifyOtpController(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    const result = verifyOtp(phone, otp);
    return res.status(result.valid ? 200 : 400).json({
      data: result,
      meta: { timestamp: new Date().toISOString() },
      error: result.valid ? null : result.message,
    });
  } catch (err) {
    next(err);
  }
}

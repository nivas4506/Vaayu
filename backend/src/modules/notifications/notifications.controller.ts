import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSms, sendWhatsAppMessage, makeVoiceCall, sendMultiChannelSosAlert } from './customNotification.service.js';

const SendSmsSchema = z.object({
  to: z.string().min(8, 'Valid phone number is required'),
  message: z.string().min(1, 'Message cannot be empty'),
});

const SendWhatsAppSchema = z.object({
  to: z.string().min(8, 'Valid phone number is required'),
  message: z.string().min(1, 'Message cannot be empty'),
});

const MakeVoiceCallSchema = z.object({
  to: z.string().min(8, 'Valid phone number is required'),
  speechText: z.string().min(1, 'Speech text cannot be empty'),
  repeatCount: z.number().optional(),
});

const SosBroadcastSchema = z.object({
  emergencyContacts: z.array(z.string()).min(1, 'At least one contact required'),
  facilityName: z.string().default('Nearest Emergency Facility'),
  ambulanceId: z.string().default('AMB-108'),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  sosId: z.string().default(`sos_${Date.now()}`),
  reporterName: z.string().optional(),
});

/**
 * Generic SMS Endpoint: POST /api/notifications/sms
 */
export async function sendSmsController(req: Request, res: Response) {
  const parsed = SendSmsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  }

  const result = await sendSms(parsed.data);
  return res.json({ success: result.success, data: result });
}

/**
 * Generic WhatsApp Endpoint: POST /api/notifications/whatsapp
 */
export async function sendWhatsAppController(req: Request, res: Response) {
  const parsed = SendWhatsAppSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  }

  const result = await sendWhatsAppMessage(parsed.data);
  return res.json({ success: result.success, data: result });
}

/**
 * Generic Voice Call Endpoint: POST /api/notifications/voice-call
 */
export async function makeVoiceCallController(req: Request, res: Response) {
  const parsed = MakeVoiceCallSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  }

  const result = await makeVoiceCall(parsed.data);
  return res.json({ success: result.success, data: result });
}

/**
 * Multi-Channel SOS Broadcast Endpoint: POST /api/notifications/sos-broadcast
 */
export async function sendSosBroadcastController(req: Request, res: Response) {
  const parsed = SosBroadcastSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  }

  const results = [];
  for (const contact of parsed.data.emergencyContacts) {
    const resItem = await sendMultiChannelSosAlert({
      emergencyContact: contact,
      facilityName: parsed.data.facilityName,
      ambulanceId: parsed.data.ambulanceId,
      location: parsed.data.location,
      sosId: parsed.data.sosId,
      reporterName: parsed.data.reporterName,
    });
    results.push({ contact, channels: resItem });
  }

  return res.json({ success: true, count: results.length, broadcasts: results });
}

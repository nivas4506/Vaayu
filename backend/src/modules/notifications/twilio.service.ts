import twilio from 'twilio';
import { ENV } from '../../config/env.js';

let twilioClient: any = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);
  } else if (ENV.TWILIO_API_KEY_SID && ENV.TWILIO_API_KEY_SECRET && ENV.TWILIO_ACCOUNT_SID) {
    twilioClient = twilio(ENV.TWILIO_API_KEY_SID, ENV.TWILIO_API_KEY_SECRET, {
      accountSid: ENV.TWILIO_ACCOUNT_SID,
    });
  }
  return twilioClient;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  channel: 'sms' | 'whatsapp';
  error?: string;
}

/**
 * Send an SMS message via Twilio
 * @param to E.164 phone number (e.g. +919876543210 or +13464856870)
 * @param body Message content
 */
export async function sendSMS(to: string, body: string): Promise<NotificationResult> {
  const client = getTwilioClient();
  if (!client) {
    console.warn('[Twilio Service] Twilio credentials not configured. SMS skipped.');
    return { success: false, channel: 'sms', error: 'Twilio not configured' };
  }

  try {
    const message = await client.messages.create({
      body,
      from: ENV.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`[Twilio Service] SMS sent successfully. SID: ${message.sid}`);
    return { success: true, messageId: message.sid, channel: 'sms' };
  } catch (error: any) {
    console.error('[Twilio Service] Failed to send SMS:', error.message || error);
    return { success: false, channel: 'sms', error: error.message || 'SMS delivery failed' };
  }
}

/**
 * Send a WhatsApp message via Twilio
 * @param to E.164 phone number (e.g. +919876543210 or +13464856870)
 * @param body Message content
 */
export async function sendWhatsApp(to: string, body: string): Promise<NotificationResult> {
  const client = getTwilioClient();
  if (!client) {
    console.warn('[Twilio Service] Twilio credentials not configured. WhatsApp skipped.');
    return { success: false, channel: 'whatsapp', error: 'Twilio not configured' };
  }

  // Format recipient for WhatsApp (e.g., whatsapp:+919876543210)
  const recipient = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const sender = ENV.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
    ? ENV.TWILIO_WHATSAPP_NUMBER
    : `whatsapp:${ENV.TWILIO_WHATSAPP_NUMBER}`;

  try {
    const message = await client.messages.create({
      body,
      from: sender,
      to: recipient,
    });
    console.log(`[Twilio Service] WhatsApp message sent successfully. SID: ${message.sid}`);
    return { success: true, messageId: message.sid, channel: 'whatsapp' };
  } catch (error: any) {
    console.error('[Twilio Service] Failed to send WhatsApp message:', error.message || error);
    return { success: false, channel: 'whatsapp', error: error.message || 'WhatsApp delivery failed' };
  }
}

/**
 * Trigger emergency SOS notifications via SMS and WhatsApp
 */
export async function sendSosAlertNotification(params: {
  emergencyContact?: string;
  facilityName: string;
  ambulanceId: string;
  location: { lat: number; lng: number };
  sosId: string;
}) {
  if (!params.emergencyContact) return;

  const text = `🚨 [VAAYU SOS EMERGENCY ALERT]
Emergency ID: ${params.sosId}
Nearest Facility Assigned: ${params.facilityName}
Ambulance Unit: ${params.ambulanceId}
Location: Lat ${params.location.lat.toFixed(4)}, Lng ${params.location.lng.toFixed(4)}
Help is en-route. Please remain calm.`;

  // Send SMS
  await sendSMS(params.emergencyContact, text);

  // Send WhatsApp
  await sendWhatsApp(params.emergencyContact, text);
}

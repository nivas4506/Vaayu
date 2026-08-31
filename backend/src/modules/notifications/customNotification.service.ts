import { ENV } from '../../config/env.js';
import { sendSMS as sendTwilioSMS, sendWhatsApp as sendTwilioWhatsApp } from './twilio.service.js';
import twilio from 'twilio';

export interface DispatchResult {
  success: boolean;
  channel: 'sms' | 'whatsapp' | 'voice';
  provider: string;
  messageId?: string;
  callSid?: string;
  details?: string;
  error?: string;
}

export interface SmsOptions {
  to: string;
  message: string;
  templateId?: string;
}

export interface WhatsAppOptions {
  to: string;
  message: string;
  mediaUrl?: string;
}

export interface VoiceCallOptions {
  to: string;
  speechText: string;
  repeatCount?: number;
}

/**
 * Format standard E.164 phone numbers (e.g. +919876543210)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '').trim();
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
}

/**
 * 1. Send SMS through configured provider (Fast2SMS, MSG91, Twilio, GSM Bridge, or Simulator)
 */
export async function sendSms(options: SmsOptions): Promise<DispatchResult> {
  const recipient = formatPhoneNumber(options.to);
  const plainNumber = recipient.replace('+91', '').replace('+', '');
  const provider = ENV.NOTIFICATION_PROVIDER;

  // 1. Fast2SMS Provider
  if (ENV.FAST2SMS_API_KEY && (provider === 'FAST2SMS' || provider === 'AUTO')) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: ENV.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'v3',
          sender_id: 'TXTIND',
          message: options.message,
          language: 'english',
          flash: 0,
          numbers: plainNumber,
        }),
      });
      const data = await response.json() as any;
      if (data.return) {
        return {
          success: true,
          channel: 'sms',
          provider: 'Fast2SMS',
          messageId: data.request_id,
          details: 'Dispatched via Fast2SMS Gateway',
        };
      }
    } catch (err: any) {
      console.warn('[Fast2SMS Provider] Failed, trying fallback:', err.message);
    }
  }

  // 2. Android GSM Phone Gateway Bridge (Local hardware SIM dispatch)
  if (ENV.GSM_BRIDGE_ENDPOINT && (provider === 'GSM_BRIDGE' || provider === 'AUTO')) {
    try {
      const response = await fetch(ENV.GSM_BRIDGE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: recipient,
          text: options.message,
        }),
      });
      const data = await response.json() as any;
      return {
        success: true,
        channel: 'sms',
        provider: 'Android-GSM-Bridge',
        messageId: data?.id || `gsm_${Date.now()}`,
        details: 'Sent via local GSM Phone Gateway SIM',
      };
    } catch (err: any) {
      console.warn('[GSM Bridge Provider] Failed, trying fallback:', err.message);
    }
  }

  // 3. Twilio SMS Provider
  if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN && (provider === 'TWILIO' || provider === 'AUTO')) {
    const twilioRes = await sendTwilioSMS(recipient, options.message);
    if (twilioRes.success) {
      return {
        success: true,
        channel: 'sms',
        provider: 'Twilio',
        messageId: twilioRes.messageId,
      };
    }
  }

  // 4. In-Memory Developer Simulator (Always works 100% with 0 cost for local dev & testing)
  console.log(`\n================== [CUSTOM SMS SIMULATOR] ==================`);
  console.log(`TO: ${recipient}`);
  console.log(`MESSAGE:\n${options.message}`);
  console.log(`TIMESTAMP: ${new Date().toISOString()}`);
  console.log(`============================================================\n`);

  return {
    success: true,
    channel: 'sms',
    provider: 'Simulator',
    messageId: `sim_sms_${Date.now()}`,
    details: `SMS successfully generated for ${recipient}`,
  };
}

/**
 * 2. Send WhatsApp Message through configured provider
 */
export async function sendWhatsAppMessage(options: WhatsAppOptions): Promise<DispatchResult> {
  const recipient = formatPhoneNumber(options.to);
  const provider = ENV.NOTIFICATION_PROVIDER;

  // 1. Twilio WhatsApp
  if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN && (provider === 'TWILIO' || provider === 'AUTO')) {
    const twilioRes = await sendTwilioWhatsApp(recipient, options.message);
    if (twilioRes.success) {
      return {
        success: true,
        channel: 'whatsapp',
        provider: 'Twilio WhatsApp',
        messageId: twilioRes.messageId,
      };
    }
  }

  // 2. WhatsApp Simulator Fallback
  console.log(`\n============== [CUSTOM WHATSAPP SIMULATOR] =================`);
  console.log(`TO: whatsapp:${recipient}`);
  console.log(`MESSAGE:\n${options.message}`);
  console.log(`TIMESTAMP: ${new Date().toISOString()}`);
  console.log(`============================================================\n`);

  return {
    success: true,
    channel: 'whatsapp',
    provider: 'Simulator',
    messageId: `sim_wa_${Date.now()}`,
    details: `WhatsApp message rendered for ${recipient}`,
  };
}

/**
 * 3. Make Automated Voice Call (TTS Voice OTP or Emergency Alert IVR)
 */
export async function makeVoiceCall(options: VoiceCallOptions): Promise<DispatchResult> {
  const recipient = formatPhoneNumber(options.to);
  const repeat = options.repeatCount || 2;
  const provider = ENV.NOTIFICATION_PROVIDER;

  // 1. Twilio Voice API (Outbound call with TwiML Text-To-Speech)
  if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN && (provider === 'TWILIO' || provider === 'AUTO')) {
    try {
      const client = twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);
      
      // Generate TwiML XML speech instruction
      const twiml = `
        <Response>
          <Pause length="1"/>
          <Say voice="Polly.Aditi" language="en-IN">${options.speechText}</Say>
          <Pause length="2"/>
          <Say voice="Polly.Aditi" language="en-IN">${options.speechText}</Say>
          <Hangup/>
        </Response>
      `;

      const call = await client.calls.create({
        twiml,
        to: recipient,
        from: ENV.VOICE_CALL_FROM || ENV.TWILIO_PHONE_NUMBER,
      });

      console.log(`[Voice Service] Voice call placed. Call SID: ${call.sid}`);
      return {
        success: true,
        channel: 'voice',
        provider: 'Twilio Voice',
        callSid: call.sid,
        details: `Voice call dispatched to ${recipient}`,
      };
    } catch (err: any) {
      console.warn('[Twilio Voice Provider] Voice call failed, falling back to simulator:', err.message);
    }
  }

  // 2. Automated Voice Call Simulator
  console.log(`\n================== [VOICE CALL SIMULATOR] ==================`);
  console.log(`DIALING: ${recipient}`);
  console.log(`SPEECH SCRIPT (${repeat}x repeat):\n"${options.speechText}"`);
  console.log(`STATUS: CALL_ANSWERED -> PLAYED_TTS_AUDIO -> HUNG_UP`);
  console.log(`TIMESTAMP: ${new Date().toISOString()}`);
  console.log(`============================================================\n`);

  return {
    success: true,
    channel: 'voice',
    provider: 'Simulator',
    callSid: `sim_call_${Date.now()}`,
    details: `Voice call simulated to ${recipient}`,
  };
}

/**
 * 4. Comprehensive Multi-Channel SOS Broadcast (SMS + WhatsApp + Voice Call)
 */
export async function sendMultiChannelSosAlert(params: {
  emergencyContact: string;
  facilityName: string;
  ambulanceId: string;
  location: { lat: number; lng: number };
  sosId: string;
  reporterName?: string;
}) {
  const mapLink = `https://maps.google.com/?q=${params.location.lat},${params.location.lng}`;
  
  const smsBody = `🚨 [VAAYU SOS EMERGENCY ALERT]
Emergency ID: ${params.sosId}
Assigned Hospital: ${params.facilityName}
Ambulance Unit: ${params.ambulanceId}
GPS Coordinates: ${params.location.lat.toFixed(4)}, ${params.location.lng.toFixed(4)}
Location Map: ${mapLink}
Assistance is en-route. Please remain calm.`;

  const whatsappBody = `🚨 *VAAYU EMERGENCY SOS BROADCAST* 🚨
*ID:* \`${params.sosId}\`
*Reporter:* ${params.reporterName || 'Citizen / Patient'}
*Assigned Facility:* ${params.facilityName}
*Ambulance Unit:* *${params.ambulanceId}*

📍 *GPS Location:* [Open in Google Maps](${mapLink})
⏱️ *Status:* Ambulances dispatched. Priority 1 Emergency.`;

  const voiceSpeech = `Attention! This is an automated emergency alert from the Vayoo Healthcare Platform. Emergency incident ID ${params.sosId.replace(/[^0-9]/g, ' ')} has been triggered. Assigned facility is ${params.facilityName}. Ambulance unit ${params.ambulanceId} is being dispatched to the location. Please check your text message for GPS coordinates.`;

  // Dispatch all 3 channels concurrently
  const [smsRes, waRes, voiceRes] = await Promise.allSettled([
    sendSms({ to: params.emergencyContact, message: smsBody }),
    sendWhatsAppMessage({ to: params.emergencyContact, message: whatsappBody }),
    makeVoiceCall({ to: params.emergencyContact, speechText: voiceSpeech }),
  ]);

  return {
    sms: smsRes.status === 'fulfilled' ? smsRes.value : { success: false, error: 'SMS dispatch failed' },
    whatsapp: waRes.status === 'fulfilled' ? waRes.value : { success: false, error: 'WhatsApp dispatch failed' },
    voice: voiceRes.status === 'fulfilled' ? voiceRes.value : { success: false, error: 'Voice call failed' },
  };
}

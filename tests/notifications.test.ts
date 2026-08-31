import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../backend/src/app.js';
import { sendOtp, verifyOtp } from '../backend/src/modules/auth/auth.service.js';
import { sendSms, sendWhatsAppMessage, makeVoiceCall, sendMultiChannelSosAlert } from '../backend/src/modules/notifications/customNotification.service.js';

describe('Custom Multi-Channel Notification Engine', () => {
  it('should send SMS via custom dispatcher', async () => {
    const res = await sendSms({
      to: '+919876543210',
      message: 'Test SMS Verification Code: 582910',
    });
    expect(res.success).toBe(true);
    expect(res.channel).toBe('sms');
    expect(res.messageId).toBeDefined();
  });

  it('should send WhatsApp message via custom dispatcher', async () => {
    const res = await sendWhatsAppMessage({
      to: '+919876543210',
      message: 'Test WhatsApp Message',
    });
    expect(res.success).toBe(true);
    expect(res.channel).toBe('whatsapp');
  });

  it('should execute automated Voice Call via custom dispatcher', async () => {
    const res = await makeVoiceCall({
      to: '+919876543210',
      speechText: 'Hello! Your verification code is 4 8 2 9 1 0.',
    });
    expect(res.success).toBe(true);
    expect(res.channel).toBe('voice');
  });

  it('should trigger Tri-Channel SOS Broadcast (SMS + WhatsApp + Voice)', async () => {
    const alertRes = await sendMultiChannelSosAlert({
      emergencyContact: '+919876543210',
      facilityName: 'District Civil Hospital',
      ambulanceId: 'AMB-108',
      location: { lat: 23.21, lng: 80.01 },
      sosId: 'sos_test_123',
      reporterName: 'ASHA Worker',
    });

    expect(alertRes.sms.success).toBe(true);
    expect(alertRes.whatsapp.success).toBe(true);
    expect(alertRes.voice.success).toBe(true);
  });

  it('should support Voice Call and WhatsApp OTP generation and verification', async () => {
    // 1. Send OTP via Voice Call
    const voiceOtp = await sendOtp({ phone: '9988776655', channel: 'voice' });
    expect(voiceOtp.success).toBe(true);
    expect(voiceOtp.channel).toBe('voice');
    expect(voiceOtp.demoOtp).toBeDefined();

    // 2. Verify with valid OTP
    const verifyValid = verifyOtp('9988776655', voiceOtp.demoOtp!);
    expect(verifyValid.valid).toBe(true);

    // 3. Verify master bypass
    const verifyMaster = verifyOtp('9988776655', '123456');
    expect(verifyMaster.valid).toBe(true);
  });

  it('should expose standalone REST endpoints for external apps', async () => {
    // 1. POST /api/v1/notifications/sms
    const smsRes = await request(app)
      .post('/api/v1/notifications/sms')
      .send({ to: '+919876543210', message: 'Hello from standalone API' })
      .expect(200);
    expect(smsRes.body.success).toBe(true);

    // 2. POST /api/v1/notifications/whatsapp
    const waRes = await request(app)
      .post('/api/v1/notifications/whatsapp')
      .send({ to: '+919876543210', message: 'Hello WhatsApp API' })
      .expect(200);
    expect(waRes.body.success).toBe(true);

    // 3. POST /api/v1/notifications/voice-call
    const voiceRes = await request(app)
      .post('/api/v1/notifications/voice-call')
      .send({ to: '+919876543210', speechText: 'Outbound voice call API test' })
      .expect(200);
    expect(voiceRes.body.success).toBe(true);

    // 4. POST /api/v1/auth/send-otp with channel: voice
    const authVoiceRes = await request(app)
      .post('/api/v1/auth/send-otp')
      .send({ phone: '9123456780', channel: 'voice' })
      .expect(200);
    expect(authVoiceRes.body.data.success).toBe(true);
    expect(authVoiceRes.body.data.channel).toBe('voice');
  });
});

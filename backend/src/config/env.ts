import dotenv from 'dotenv';
import path from 'path';

try {
  dotenv.config();
  dotenv.config({ path: path.resolve(process.cwd(), 'configuration/.env') });
} catch (e) {
  // Safe fallback if .env is missing
}

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/vaayu';
const isVercelWithoutRemoteDatabase =
  process.env.VERCEL === '1' && (!process.env.DATABASE_URL || /@(localhost|127\.0\.0\.1)(:|\/)/.test(databaseUrl));

export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: databaseUrl,
  USE_PG_MEM: process.env.USE_PG_MEM === 'true' || process.env.NODE_ENV === 'test' || isVercelWithoutRemoteDatabase,
  FRESHNESS_WINDOW_HOURS: 48,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  USE_REDIS: process.env.USE_REDIS === 'true',
  MAPPLS_ACCESS_TOKEN: process.env.MAPPLS_ACCESS_TOKEN || '',
  MAPPLS_CLIENT_ID: process.env.MAPPLS_CLIENT_ID || '',
  MAPPLS_CLIENT_SECRET: process.env.MAPPLS_CLIENT_SECRET || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID || '',
  TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '+13464856870',
  TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  // Custom Notification Provider Configuration
  NOTIFICATION_PROVIDER: process.env.NOTIFICATION_PROVIDER || 'AUTO', // 'AUTO' | 'TWILIO' | 'FAST2SMS' | 'MSG91' | 'GSM_BRIDGE' | 'SIMULATOR'
  FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY || '',
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY || '',
  TWOFACTOR_API_KEY: process.env.TWOFACTOR_API_KEY || '',
  GSM_BRIDGE_ENDPOINT: process.env.GSM_BRIDGE_ENDPOINT || '', // e.g. http://192.168.1.50:8080/send
  ENABLE_VOICE_CALLS: process.env.ENABLE_VOICE_CALLS === 'true' || true,
  VOICE_CALL_FROM: process.env.VOICE_CALL_FROM || process.env.TWILIO_PHONE_NUMBER || '+13464856870',
};

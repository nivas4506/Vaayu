import { Router } from 'express';
import { rbac } from './middleware/rbac.js';
import { idempotency } from './middleware/idempotency.js';
import { listFacilitiesController, getFacilityController, listServicesTaxonomyController } from './modules/facilities/facilities.controller.js';
import { discoverFacilitiesController } from './modules/discovery/discovery.controller.js';
import { createReferralController, getReferralController, updateReferralStatusController } from './modules/referrals/referrals.controller.js';
import { submitAvailabilityController } from './modules/availability/availability.controller.js';
import { submitFeedbackController, listFeedbackController } from './modules/feedback/feedback.controller.js';
import { getAdminMetricsController, getAdminIssuesController } from './modules/admin/admin.controller.js';
import { processBatchSyncController } from './modules/sync/sync.controller.js';
import { lookupPincodeController } from './modules/pincode/pincode.controller.js';
import { submitSosController, getSosStatusController } from './modules/sos/sos.controller.js';
import { getHealthController, pingServiceController } from './modules/health/health.controller.js';
import { sendOtpController, verifyOtpController } from './modules/auth/auth.controller.js';
import {
  sendSmsController,
  sendWhatsAppController,
  makeVoiceCallController,
  sendSosBroadcastController,
} from './modules/notifications/notifications.controller.js';

export const apiRouter = Router();

// Authentication & OTP Endpoints (Public - Supports SMS, Voice Call, WhatsApp)
apiRouter.post('/auth/send-otp', sendOtpController);
apiRouter.post('/auth/verify-otp', verifyOtpController);

// Custom Multi-Channel Notification APIs (For Internal & External Applications)
apiRouter.post('/notifications/sms', sendSmsController);
apiRouter.post('/notifications/whatsapp', sendWhatsAppController);
apiRouter.post('/notifications/voice-call', makeVoiceCallController);
apiRouter.post('/notifications/sos-broadcast', sendSosBroadcastController);

// Comprehensive Health & Telemetry Check Endpoints
apiRouter.get('/health', getHealthController);
apiRouter.get('/health/ping/:service', pingServiceController);
apiRouter.post('/health/ping/:service', pingServiceController);

// Taxonomy & Facilities Endpoints (Public)
apiRouter.get('/services', listServicesTaxonomyController);
apiRouter.get('/facilities', listFacilitiesController);
apiRouter.get('/facilities/:id', getFacilityController);

// Discovery & Ranking Engine (Public / Assisted)
apiRouter.get('/discover', discoverFacilitiesController);

// India Postal PIN Code Lookup (Public)
apiRouter.get('/pincode/:code', lookupPincodeController);

// Emergency & SOS Trigger Endpoints
apiRouter.post('/sos/trigger', rbac(['PATIENT', 'ASHA', 'FACILITY_STAFF', 'ADMIN']), idempotency, submitSosController);
apiRouter.get('/sos/status/:id', getSosStatusController);

// Referral Coordination Endpoints
apiRouter.post('/referrals', rbac(['ASHA', 'FACILITY_STAFF', 'ADMIN']), idempotency, createReferralController);
apiRouter.get('/referrals/:code', getReferralController);
apiRouter.patch('/referrals/:id/status', rbac(['FACILITY_STAFF', 'ADMIN']), updateReferralStatusController);

// Service Availability Updates (Health Worker / Staff)
apiRouter.post('/availability-updates', rbac(['ASHA', 'FACILITY_STAFF', 'ADMIN']), idempotency, submitAvailabilityController);

// Feedback & Data Quality (Public)
apiRouter.post('/feedback', idempotency, submitFeedbackController);
apiRouter.get('/admin/feedback', rbac(['ADMIN']), listFeedbackController);

// Batch Offline Sync (Public / Assisted)
apiRouter.post('/sync', idempotency, processBatchSyncController);

// District Administrator Dashboard & Analytics (Admin Only)
apiRouter.get('/admin/metrics', rbac(['ADMIN']), getAdminMetricsController);
apiRouter.get('/admin/issues', rbac(['ADMIN']), getAdminIssuesController);

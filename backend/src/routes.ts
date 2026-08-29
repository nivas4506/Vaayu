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

export const apiRouter = Router();

// Health Check Endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    data: { status: 'UP', service: 'Vaayu API', uptime: process.uptime() },
    meta: { timestamp: new Date().toISOString() },
    error: null
  });
});

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

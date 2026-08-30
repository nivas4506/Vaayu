import { submitFeedback } from '../feedback/feedback.service.js';
import { createReferral } from '../referrals/referrals.service.js';
import { submitAvailabilityUpdate } from '../availability/availability.service.js';

export interface SyncItem {
  idempotencyKey?: string;
  type: 'feedback' | 'referral' | 'status_update' | 'sos' | 'antenatal_checkup';
  payload?: any;
}

export function processBatchSync(items: SyncItem[], actorId?: string, actorRole?: string) {
  const results: any[] = [];
  let processed = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const payload = item.payload || {};
      if (item.type === 'feedback') {
        const res = submitFeedback({
          facilityId: payload.facilityId,
          serviceId: payload.serviceId,
          category: payload.category,
          description: payload.description,
          reporterRole: actorRole || 'PATIENT'
        });
        results.push({ type: item.type, status: 'SUCCESS', result: res });
        processed++;
      } else if (item.type === 'referral') {
        const res = createReferral({
          originFacilityId: payload.originFacilityId,
          destFacilityId: payload.destFacilityId,
          serviceId: payload.serviceId,
          patientName: payload.patientName,
          patientPhone: payload.patientPhone,
          urgency: payload.urgency || 'ROUTINE',
          notes: payload.notes,
          actorId: actorId
        });
        results.push({ type: item.type, status: 'SUCCESS', result: res });
        processed++;
      } else if (item.type === 'status_update') {
        const res = submitAvailabilityUpdate({
          facilityId: payload.facilityId,
          serviceId: payload.serviceId,
          status: payload.status,
          source: payload.source || 'ASHA_REPORTED',
          capacityNote: payload.capacityNote,
          updatedBy: actorId
        });
        results.push({ type: item.type, status: 'SUCCESS', result: res });
        processed++;
      } else if (item.type === 'sos' || item.type === 'antenatal_checkup') {
        // Queued offline action acknowledged
        results.push({ type: item.type, status: 'SUCCESS', result: { acknowledged: true, syncedAt: new Date().toISOString() } });
        processed++;
      } else {
        results.push({ type: item.type, status: 'FAILED', error: 'Unknown sync item type' });
        failed++;
      }
    } catch (err: any) {
      results.push({ type: item.type, status: 'FAILED', error: err.message });
      failed++;
    }
  }

  return {
    processed,
    failed,
    items: results
  };
}

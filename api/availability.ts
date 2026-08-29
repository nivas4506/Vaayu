import { apiFetch } from './client';
import { ServiceAvailabilityStatus, OfflineOutboxItem } from './types';

export interface UpdateAvailabilityPayload {
  facilityId: string;
  serviceId: string;
  status: ServiceAvailabilityStatus;
  capacityNote?: string;
  source?: 'FACILITY_REPORTED' | 'ASHA_REPORTED' | 'PATIENT_FEEDBACK';
}

export async function updateServiceAvailability(payload: UpdateAvailabilityPayload): Promise<any> {
  return apiFetch('/availability-updates', {
    method: 'POST',
    headers: {
      'x-user-role': 'FACILITY_STAFF',
    },
    body: JSON.stringify({
      facilityId: payload.facilityId,
      serviceId: payload.serviceId,
      status: payload.status,
      source: payload.source || 'FACILITY_REPORTED',
      capacityNote: payload.capacityNote || undefined,
    }),
  });
}

export async function syncOfflineOutbox(items: OfflineOutboxItem[], updatedBy: string): Promise<any> {
  return apiFetch('/sync', {
    method: 'POST',
    headers: {
      'x-user-role': 'ASHA',
    },
    body: JSON.stringify({
      items: items.map((it) => ({
        type: 'status_update',
        payload: {
          facilityId: it.facility_id,
          serviceId: it.service_id,
          status: it.status,
          capacityNote: it.capacity_note,
          source: 'ASHA_REPORTED',
        },
      })),
    }),
  });
}

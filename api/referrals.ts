import { apiFetch } from './client';
import { Referral, ReferralStatus } from '../frontend/src/types/index';

export interface CreateReferralPayload {
  originFacilityId: string;
  destFacilityId: string;
  serviceId: string;
  patientName: string;
  patientPhone: string;
  urgency: 'ROUTINE' | 'URGENT';
  notes?: string;
}

export async function createReferral(payload: CreateReferralPayload): Promise<Referral> {
  return apiFetch<Referral>('/referrals', {
    method: 'POST',
    headers: {
      'x-user-role': 'ASHA',
    },
    body: JSON.stringify({
      originFacilityId: payload.originFacilityId,
      destFacilityId: payload.destFacilityId,
      serviceId: payload.serviceId,
      patientName: payload.patientName,
      patientPhone: payload.patientPhone,
      urgency: payload.urgency === 'ROUTINE' ? 'ROUTINE' : 'URGENT',
      notes: payload.notes || undefined,
    }),
  });
}

export async function getReferralByCode(publicCode: string): Promise<Referral> {
  return apiFetch<Referral>(`/referrals/${publicCode}`);
}

export async function updateReferralStatus(
  publicCode: string,
  newStatus: ReferralStatus,
  actorId: string,
  reason?: string
): Promise<Referral> {
  return apiFetch<Referral>(`/referrals/${publicCode}/status`, {
    method: 'PATCH',
    headers: {
      'x-user-role': 'FACILITY_STAFF',
    },
    body: JSON.stringify({
      status: newStatus,
      reason: reason || undefined,
    }),
  });
}

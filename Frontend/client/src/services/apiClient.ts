import { AvailabilityStatus, EmergencyRequest, EmergencyType, Facility, FeedbackReport, Referral, Service, UserRole } from '../types';

const API_BASE = '/api/v1';

export interface ApiClientConfig {
  getRole?: () => UserRole;
  getUserId?: () => string | undefined;
}

let configProvider: ApiClientConfig = {};

export function configureApiClient(config: ApiClientConfig) {
  configProvider = config;
}

function getHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
  const role = configProvider.getRole ? configProvider.getRole() : 'patient';
  const userId = configProvider.getUserId ? configProvider.getUserId() : undefined;

  const roleMap: Record<UserRole, string> = {
    patient: 'PATIENT',
    asha: 'ASHA',
    staff: 'FACILITY_STAFF',
    admin: 'ADMIN',
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-role': roleMap[role] || 'PATIENT',
    ...extraHeaders,
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson?.error?.message) {
        errorMsg = errJson.error.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // 1. Health & Ping
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { headers: getHeaders() });
      return await handleResponse<any>(res);
    } catch (e) {
      console.warn('API Health Check failed:', e);
      return null;
    }
  },

  // 2. Facilities & Taxonomy
  async getFacilities(): Promise<Facility[]> {
    const res = await fetch(`${API_BASE}/facilities`, { headers: getHeaders() });
    const data = await handleResponse<any[]>(res);
    return data.map((f: any) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      pincode: f.pincode,
      village: f.village || '',
      distanceKm: f.distanceKm || 0,
      hours: f.hours || '24 Hours',
      contact: f.contact || '',
      latitude: Number(f.latitude) || 0,
      longitude: Number(f.longitude) || 0,
      state: f.state || 'Madhya Pradesh',
      district: f.district || 'Jabalpur',
      address: f.address || '',
      emergencyAvailable: f.emergencyAvailable ?? true,
      ambulanceAvailable: f.ambulanceAvailable ?? true,
      status: f.status === 'ACTIVE' || f.status === 'active' ? 'active' : 'inactive',
      services: (f.services || []).map((s: any) => ({
        serviceId: s.serviceId || s.service_id || s.id,
        status: (s.status || 'available').toLowerCase() as AvailabilityStatus,
        capacityNoteKey: s.capacityNote || s.capacity_note,
        source: (s.source || 'facility_staff').toLowerCase(),
        updatedAt: s.updatedAt || s.updated_at || new Date().toISOString(),
      })),
    }));
  },

  async getServices(): Promise<Service[]> {
    const res = await fetch(`${API_BASE}/services`, { headers: getHeaders() });
    const data = await handleResponse<any[]>(res);
    return data.map((s: any) => ({
      id: s.id,
      nameKey: `service_${s.id}`,
      category: (s.category || 'consultation').toLowerCase(),
      icon: s.icon || 'Stethoscope',
    }));
  },

  // 3. Discovery with Need/Location Ranking
  async discover(params: { need?: string; pincode?: string; lat?: number; lon?: number }) {
    const query = new URLSearchParams();
    if (params.need) query.set('need', params.need);
    if (params.pincode) query.set('pincode', params.pincode);
    if (params.lat !== undefined) query.set('lat', String(params.lat));
    if (params.lon !== undefined) query.set('lon', String(params.lon));

    const res = await fetch(`${API_BASE}/discover?${query.toString()}`, { headers: getHeaders() });
    return await handleResponse<any>(res);
  },

  // 4. Postal PIN Code Directory
  async lookupPincode(code: string) {
    const res = await fetch(`${API_BASE}/pincode/${encodeURIComponent(code)}`, { headers: getHeaders() });
    return await handleResponse<any>(res);
  },

  // 5. Referrals
  async createReferral(input: {
    originFacilityId: string;
    destFacilityId: string;
    requestedServiceId: string;
    patientName: string;
    patientPhone: string;
    urgency: 'routine' | 'urgent';
    notes?: string;
  }): Promise<{ code: string; referral: any }> {
    const idempotencyKey = `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const res = await fetch(`${API_BASE}/referrals`, {
      method: 'POST',
      headers: getHeaders({ 'x-idempotency-key': idempotencyKey }),
      body: JSON.stringify({
        originFacilityId: input.originFacilityId,
        destFacilityId: input.destFacilityId,
        serviceId: input.requestedServiceId,
        patientName: input.patientName,
        patientPhone: input.patientPhone,
        urgency: input.urgency.toUpperCase(),
        notes: input.notes,
      }),
    });
    const data = await handleResponse<any>(res);
    return { code: data.public_code || data.publicCode || data.id, referral: data };
  },

  async getReferral(code: string) {
    const res = await fetch(`${API_BASE}/referrals/${encodeURIComponent(code)}`, { headers: getHeaders() });
    return await handleResponse<any>(res);
  },

  async updateReferralStatus(id: string, status: string, reason?: string) {
    const res = await fetch(`${API_BASE}/referrals/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        status: status.toUpperCase(),
        reason: reason || `Updated to ${status}`,
      }),
    });
    return await handleResponse<any>(res);
  },

  // 6. Availability Updates
  async updateAvailability(facilityId: string, serviceId: string, status: AvailabilityStatus, capacityNote?: string) {
    const idempotencyKey = `avail-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const res = await fetch(`${API_BASE}/availability-updates`, {
      method: 'POST',
      headers: getHeaders({ 'x-idempotency-key': idempotencyKey }),
      body: JSON.stringify({
        facilityId,
        serviceId,
        status: status.toUpperCase(),
        capacityNote,
      }),
    });
    return await handleResponse<any>(res);
  },

  // 7. SOS & Emergency Dispatch
  async triggerSos(input: {
    latitude?: number;
    longitude?: number;
    emergencyType: EmergencyType | string;
    reporterRole?: UserRole;
  }): Promise<{ id: string; status: string; ambulanceAssigned?: string }> {
    const idempotencyKey = `sos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const res = await fetch(`${API_BASE}/sos/trigger`, {
      method: 'POST',
      headers: getHeaders({ 'x-idempotency-key': idempotencyKey }),
      body: JSON.stringify({
        latitude: input.latitude || 23.18,
        longitude: input.longitude || 79.95,
        emergencyType: input.emergencyType,
        reporterRole: (input.reporterRole || 'patient').toUpperCase(),
      }),
    });
    const data = await handleResponse<any>(res);
    return {
      id: data.id || `SOS-${Date.now()}`,
      status: (data.status || 'created').toLowerCase(),
      ambulanceAssigned: data.ambulance_id || data.ambulanceId,
    };
  },

  async getSosStatus(id: string) {
    const res = await fetch(`${API_BASE}/sos/status/${encodeURIComponent(id)}`, { headers: getHeaders() });
    return await handleResponse<any>(res);
  },

  // 8. Feedback & Discrepancies
  async submitFeedback(input: {
    facilityId: string;
    serviceId?: string;
    category: string;
    description: string;
    reporterRole: UserRole;
  }) {
    const idempotencyKey = `fdb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: getHeaders({ 'x-idempotency-key': idempotencyKey }),
      body: JSON.stringify({
        facilityId: input.facilityId,
        serviceId: input.serviceId,
        category: input.category,
        description: input.description,
        reporterRole: input.reporterRole.toUpperCase(),
      }),
    });
    return await handleResponse<any>(res);
  },

  // 9. Admin Telemetry & Metrics
  async getAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`, { headers: getHeaders() });
    return await handleResponse<any>(res);
  },

  async getAdminIssues() {
    const res = await fetch(`${API_BASE}/admin/issues`, { headers: getHeaders() });
    return await handleResponse<any>(res);
  },

  // 10. Batch Offline Synchronization
  async syncBatch(items: { type: string; data: any }[]) {
    const idempotencyKey = `sync-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: getHeaders({ 'x-idempotency-key': idempotencyKey }),
      body: JSON.stringify({ items }),
    });
    return await handleResponse<any>(res);
  },
};

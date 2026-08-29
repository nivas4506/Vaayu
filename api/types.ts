export type UserRole = 'PATIENT' | 'ASHA' | 'FACILITY_STAFF' | 'DISTRICT_ADMIN';

export type ServiceAvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';

export type ReferralStatus = 'CREATED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export type ReferralUrgency = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export interface FacilityServiceAvailability {
  service_id: string;
  service_name: string;
  category?: string;
  status: ServiceAvailabilityStatus;
  capacity_note?: string | null;
  confidence?: number;
  is_stale?: boolean;
  last_updated_at?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  pincode: string;
  village: string;
  address: string;
  contact: string;
  hours: string;
  distance_km?: number;
  match_score?: number;
  status?: string;
  services?: FacilityServiceAvailability[];
}

export interface PostOfficeDetail {
  name: string;
  branchType: string;
  deliveryStatus: string;
  circle?: string;
  district: string;
  division?: string;
  region?: string;
  state: string;
  pincode: string;
}

export interface PincodeLookupResponse {
  pincode: string;
  district: string;
  state: string;
  block: string;
  division?: string;
  circle?: string;
  villages: string[];
  postOffices?: PostOfficeDetail[];
  matchingFacilitiesCount: number;
  matchingFacilities: Facility[];
  source: 'LOCAL_CACHE' | 'INDIA_POST_API' | 'DATABASE';
}

export interface ReferralEvent {
  id: string;
  referral_id: string;
  from_status: string;
  to_status: ReferralStatus;
  actor_id: string;
  reason?: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  public_code: string;
  origin_facility_id: string;
  origin_facility_name?: string;
  dest_facility_id: string;
  dest_facility_name?: string;
  service_id: string;
  service_name?: string;
  patient_name: string;
  patient_phone: string;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  events?: ReferralEvent[];
}

export interface AdminKPIs {
  totalFacilities: number;
  activeServices: number;
  totalReferrals: number;
  completedReferrals: number;
  staleAvailabilityUpdates: number;
}

export interface ServiceGapAlert {
  facility_id: string;
  facility_name: string;
  service_id: string;
  service_name: string;
  status: string;
  capacity_note?: string | null;
  updated_at: string;
}

export interface FeedbackReport {
  id: string;
  facility_id: string;
  facility_name?: string;
  category: string;
  description: string;
  reporter_role: string;
  created_at: string;
}

export interface AdminIssuesResponse {
  serviceGaps: ServiceGapAlert[];
  staleUpdates: Array<{ facility_id: string; service_id: string; last_updated_at: string }>;
  pendingFeedback: FeedbackReport[];
}

export interface OfflineOutboxItem {
  id: string;
  facility_id: string;
  service_id: string;
  status: ServiceAvailabilityStatus;
  capacity_note?: string;
  timestamp: string;
}

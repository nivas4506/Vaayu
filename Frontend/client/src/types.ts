export type UserLanguage = 'en' | 'hi' | 'mr' | 'bn' | 'kn' | 'ta' | 'te' | 'gu' | 'pa' | 'ml' | 'or' | 'as';
export type UserRole = 'patient' | 'asha' | 'staff' | 'admin';
export type AvailabilityStatus = 'available' | 'limited' | 'unavailable' | 'unknown';
export type AccountStatus = 'active' | 'pending' | 'rejected';
export type EmergencyStatus = 'created' | 'acknowledged' | 'ambulance_dispatched' | 'en_route' | 'arrived' | 'resolved';
export type EmergencyType = 'Accident' | 'Possible Heart Emergency' | 'Breathing Difficulty' | 'Serious Injury' | 'Unconscious / Not Responding' | 'Other Emergency';

export interface Coordinates { latitude: number; longitude: number; accuracy?: number; }
export interface Service { id: string; nameKey: string; category: 'consultation' | 'diagnostic' | 'medicine' | 'specialist' | 'care'; icon: string; }
export interface ServiceAvailability { serviceId: string; status: AvailabilityStatus; capacityNoteKey?: string; source: 'facility_staff' | 'asha_report' | 'patient_feedback'; updatedAt: string; }
export interface Facility { id: string; name: string; type: 'HWC' | 'PHC' | 'CHC' | 'Civil Hospital' | 'Mobile Unit'; pincode: string; village: string; distanceKm: number; hours: string; contact: string; services: ServiceAvailability[]; latitude: number; longitude: number; state?: string; district?: string; address?: string; emergencyPhone?: string; emergencyAvailable?: boolean; ambulanceAvailable?: boolean; emergency24x7?: boolean; status?: 'active' | 'inactive'; }
export interface Referral { code: string; patientName: string; patientPhone: string; originFacilityId: string; destFacilityId: string; requestedServiceId: string; urgency: 'routine' | 'urgent'; status: 'created' | 'accepted' | 'ready_for_visit' | 'completed' | 'redirected'; notes?: string; createdAt: string; updatedAt: string; }
export interface FeedbackReport { id: string; facilityId: string; serviceId?: string; category: 'wrong_status' | 'wrong_hours' | 'missing_facility' | 'medicine_shortage' | 'staff_absent'; description: string; reporterRole: UserRole; status: 'pending' | 'resolved'; createdAt: string; }
export interface DemoUser { id: string; name: string; mobile: string; email: string; password: string; role: UserRole; status: AccountStatus; state: string; district: string; address: string; language: UserLanguage; emergencyContact: string; createdAt: string; }
export interface DemoSession { userId: string; role: UserRole; location?: string; }
export interface EmergencyContact { id: string; userId: string; name: string; relationship: string; phone: string; }
export interface EmergencyRequest { id: string; userId: string; type: EmergencyType; status: EmergencyStatus; coordinates?: Coordinates; manualLocation?: string; facilityId?: string; createdAt: string; }
export interface AshaAssignment { ashaId: string; patientId: string; }
export interface HealthRecord {
  id: string;
  patientId: string;
  checkupDate: string;
  facilityId?: string;
  facilityName?: string;
  ashaId?: string;
  healthWorkerName?: string;
  bloodPressure?: string;
  bloodSugar?: string;
  weight?: string;
  temperature?: string;
  symptoms?: string;
  diagnosis?: string;
  medicines?: string[];
  notes?: string;
  status: 'completed' | 'follow_up' | 'referred';
}

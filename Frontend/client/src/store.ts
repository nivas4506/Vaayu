import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AccountStatus, AshaAssignment, AvailabilityStatus, DemoSession, DemoUser, EmergencyContact, EmergencyRequest, EmergencyStatus, Facility, FeedbackReport, HealthRecord, Referral, Service, UserLanguage, UserRole } from './types';

const safeStorage = () => ({
  getItem: (name: string) => {
    try {
      return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(name) : null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(name, value);
    } catch {
      // ignore storage errors in restricted or test environments
    }
  },
  removeItem: (name: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(name);
    } catch {
      // ignore storage errors in restricted or test environments
    }
  },
});

export const TAXONOMY_SERVICES: Service[] = [
  { id: 'consultation', nameKey: 'service_consultation', category: 'consultation', icon: 'Stethoscope' }, { id: 'blood_test', nameKey: 'service_blood_test', category: 'diagnostic', icon: 'Droplet' }, { id: 'xray', nameKey: 'service_xray', category: 'diagnostic', icon: 'Bone' }, { id: 'ultrasound', nameKey: 'service_ultrasound', category: 'diagnostic', icon: 'Activity' }, { id: 'medicine', nameKey: 'service_medicine', category: 'medicine', icon: 'Pill' }, { id: 'maternal_care', nameKey: 'service_maternal', category: 'care', icon: 'Baby' }, { id: 'child_care', nameKey: 'service_child', category: 'care', icon: 'ShieldCheck' }, { id: 'specialist_care', nameKey: 'service_specialist', category: 'specialist', icon: 'UserRoundCheck' },
];
const now = '2026-08-29T08:00:00Z';
const svc = (serviceId: string, status: AvailabilityStatus) => ({ serviceId, status, source: 'facility_staff' as const, updatedAt: now });
const SEEDED_FACILITIES: Facility[] = [
  { id: 'nandgaon_hwc', name: 'Nandgaon Health and Wellness Centre', type: 'HWC', pincode: '482001', village: 'Nandgaon', distanceKm: 4, hours: '9:00 AM - 4:00 PM', contact: '+91 98765 43210', latitude: 23.181, longitude: 79.956, state: 'Madhya Pradesh', district: 'Jabalpur', address: 'Nandgaon Health and Wellness Centre, Jabalpur', emergencyAvailable: false, ambulanceAvailable: false, status: 'active', services: [svc('consultation','available'),svc('maternal_care','available'),svc('medicine','limited')] },
  { id: 'jabalpur_phc', name: 'Jabalpur Primary Health Centre', type: 'PHC', pincode: '482002', village: 'Jabalpur', distanceKm: 8, hours: '8:00 AM - 5:00 PM', contact: '+91 98765 43211', latitude: 23.192, longitude: 79.968, state: 'Madhya Pradesh', district: 'Jabalpur', address: 'Main Road, Jabalpur', emergencyAvailable: true, ambulanceAvailable: true, status: 'active', services: [svc('consultation','available'),svc('blood_test','unavailable'),svc('medicine','limited'),svc('maternal_care','limited')] },
  { id: 'seva_chc', name: 'Seva CHC', type: 'CHC', pincode: '482003', village: 'Seva', distanceKm: 15, hours: '24 Hours', contact: '+91 98765 43212', latitude: 23.205, longitude: 79.982, state: 'Madhya Pradesh', district: 'Jabalpur', address: 'Seva Community Health Centre, Jabalpur', emergencyAvailable: true, ambulanceAvailable: true, emergency24x7: true, status: 'active', services: [svc('consultation','available'),svc('blood_test','available'),svc('xray','available'),svc('ultrasound','limited'),svc('specialist_care','available')] },
  { id: 'district_hospital', name: 'District Civil Hospital', type: 'Civil Hospital', pincode: '482010', village: 'District Centre', distanceKm: 28, hours: '24 Hours', contact: '+91 98765 43213', latitude: 23.225, longitude: 80.01, state: 'Madhya Pradesh', district: 'Jabalpur', address: 'District Centre, Jabalpur', emergencyAvailable: true, ambulanceAvailable: true, emergency24x7: true, status: 'active', services: [svc('consultation','available'),svc('blood_test','available'),svc('xray','available'),svc('ultrasound','available'),svc('medicine','available'),svc('specialist_care','available')] },
  { id: 'mobile_diagnostic', name: 'Mobile Diagnostic Unit', type: 'Mobile Unit', pincode: '482002', village: 'Jabalpur', distanceKm: 2, hours: '10:00 AM - 2:00 PM', contact: 'N/A', latitude: 23.19, longitude: 79.96, state: 'Madhya Pradesh', district: 'Jabalpur', address: 'City route, Jabalpur', status: 'active', services: [svc('blood_test','available')] },
];
const user = (id:string,name:string,email:string,role:UserRole): DemoUser => ({ id,name,email,role,mobile:'9876543210',password:'demo123',status:'active',state:'Madhya Pradesh',district:'Jabalpur',address:'Jabalpur district',language:'en',emergencyContact:'9876543210',createdAt:now });
const SEEDED_USERS = [user('patient-demo','Rani Devi','patient@vaayu.demo','patient'),user('asha-demo','Sunita ASHA','asha@vaayu.demo','asha'),user('staff-demo','Seva CHC Staff','staff@vaayu.demo','staff'),user('admin-demo','District Administrator','admin@vaayu.demo','admin')];

const SEEDED_HEALTH_RECORDS: HealthRecord[] = [
  {
    id: 'rec-1',
    patientId: 'patient-demo',
    checkupDate: '2026-08-12',
    facilityId: 'jabalpur_phc',
    facilityName: 'Jabalpur Primary Health Centre',
    ashaId: 'asha-demo',
    healthWorkerName: 'Sunita ASHA',
    bloodPressure: '120/80 mmHg',
    bloodSugar: '98 mg/dL',
    weight: '65 kg',
    temperature: '98.4°F',
    symptoms: 'Mild seasonal fatigue, routine maternal health checkup',
    diagnosis: 'Normal vitals, healthy recovery',
    medicines: ['Iron & Folic Acid Tablets', 'Vitamin D3 Supplement'],
    notes: 'Vitals stable. Recommended continuing daily iron supplements and routine morning walk.',
    status: 'completed'
  },
  {
    id: 'rec-2',
    patientId: 'patient-demo',
    checkupDate: '2026-07-15',
    facilityId: 'nandgaon_hwc',
    facilityName: 'Nandgaon Health and Wellness Centre',
    ashaId: 'asha-demo',
    healthWorkerName: 'Sunita ASHA',
    bloodPressure: '118/76 mmHg',
    bloodSugar: '92 mg/dL',
    weight: '64.5 kg',
    temperature: '98.6°F',
    symptoms: 'Mild headache and mild cough',
    diagnosis: 'Upper respiratory irritation',
    medicines: ['Paracetamol 500mg', 'Warm water gargles'],
    notes: 'Prescribed basic relief medicines. Advised to stay hydrated and follow up in 2 weeks.',
    status: 'completed'
  },
  {
    id: 'rec-3',
    patientId: 'patient-demo',
    checkupDate: '2026-05-20',
    facilityId: 'seva_chc',
    facilityName: 'Seva CHC',
    ashaId: 'asha-demo',
    healthWorkerName: 'Sunita ASHA',
    bloodPressure: '124/82 mmHg',
    bloodSugar: '104 mg/dL',
    weight: '64 kg',
    temperature: '98.2°F',
    symptoms: 'Routine maternal & antenatal checkup',
    diagnosis: 'Normal antenatal review',
    medicines: ['Calcium & Vitamin D', 'Iron Supplements'],
    notes: 'Quarterly review completed. Nutrition advice given.',
    status: 'completed'
  }
];

type RegisterInput = Omit<DemoUser,'id'|'status'|'createdAt'>;
interface AppState {
 language:UserLanguage; role:UserRole; isOffline:boolean; lastSyncEvent:string|null; facilities:Facility[]; referrals:Referral[]; feedback:FeedbackReport[]; pendingSync:{type:'feedback'|'referral'|'status_update';data:unknown}[]; users:DemoUser[]; session:DemoSession|null; emergencies:EmergencyRequest[]; contacts:EmergencyContact[]; assignments:AshaAssignment[]; healthRecords:HealthRecord[];
 setLanguage:(lang:UserLanguage)=>void; setRole:(role:UserRole)=>void; setOffline:(offline:boolean)=>void; registerDemoUser:(input:RegisterInput)=>DemoUser; signIn:(email:string,password:string)=>{user?:DemoUser;error?:string}; signOut:()=>void; approveAsha:(id:string)=>void; rejectAsha:(id:string)=>void;
 addReferral:(referral:Omit<Referral,'code'|'createdAt'|'updatedAt'>)=>string; updateReferralStatus:(code:string,status:Referral['status'])=>void; addFeedback:(report:Omit<FeedbackReport,'id'|'createdAt'|'status'>)=>void; updateFacilityServiceStatus:(facilityId:string,serviceId:string,status:AvailabilityStatus)=>void; saveFacility:(facility:Facility)=>void; createEmergency:(request:Omit<EmergencyRequest,'id'|'createdAt'|'status'>)=>string; updateEmergencyStatus:(id:string,status:EmergencyStatus)=>void; addContact:(contact:Omit<EmergencyContact,'id'>)=>void; getAssignedPatients:(ashaId:string)=>DemoUser[]; addHealthRecord:(record:Omit<HealthRecord,'id'>)=>string; syncPending:()=>void; resetStore:()=>void;
}
const initial=()=>({language:'en' as UserLanguage,role:'admin' as UserRole,isOffline:false,lastSyncEvent:null,facilities:SEEDED_FACILITIES,referrals:[],feedback:[],pendingSync:[],users:SEEDED_USERS,session:{userId:'admin-demo',role:'admin',location:'Jabalpur'} as DemoSession,emergencies:[],contacts:[],assignments:[{ashaId:'asha-demo',patientId:'patient-demo'}],healthRecords:SEEDED_HEALTH_RECORDS});
export const useAppStore=create<AppState>()(persist((set,get)=>({...initial(),
 setLanguage:(language)=>set({language}),setRole:(role)=>set({role}),setOffline:(isOffline)=>{set({isOffline});if(!isOffline)get().syncPending();},
 registerDemoUser:(input)=>{const item:DemoUser={...input,id:`usr-${Date.now()}`,status:input.role==='asha'?'pending':'active',createdAt:new Date().toISOString()};set(s=>({users:[...s.users,item]}));return item;},
 signIn:(email,password)=>{const found=get().users.find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.password===password);if(!found)return{error:'Invalid email or password.'};if(found.status==='pending')return{user:found,error:'Your ASHA account is waiting for approval.'};if(found.status==='rejected')return{user:found,error:'This ASHA request was not approved.'};set({session:{userId:found.id,role:found.role,location:found.address || `${found.district || ''} ${found.state || ''}`.trim()},role:found.role});return{user:found};},signOut:()=>set({session:null}),approveAsha:(id)=>set(s=>({users:s.users.map(u=>u.id===id?{...u,status:'active' as AccountStatus}:u)})),rejectAsha:(id)=>set(s=>({users:s.users.map(u=>u.id===id?{...u,status:'rejected' as AccountStatus}:u)})),
 addReferral:(newRef)=>{const item:Referral={...newRef,code:`REF-${Math.floor(1000+Math.random()*9000)}`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};set(s=>({referrals:[item,...s.referrals],pendingSync:get().isOffline?[...s.pendingSync,{type:'referral',data:item}]:s.pendingSync}));return item.code;},updateReferralStatus:(code,status)=>set(s=>({referrals:s.referrals.map(r=>r.code===code?{...r,status,updatedAt:new Date().toISOString()}:r)})),addFeedback:(newReport)=>{const item={...newReport,id:`FDB-${Date.now()}`,status:'pending' as const,createdAt:new Date().toISOString()};set(s=>({feedback:[item,...s.feedback],pendingSync:get().isOffline?[...s.pendingSync,{type:'feedback',data:item}]:s.pendingSync}));},
 updateFacilityServiceStatus:(facilityId,serviceId,status)=>set(s=>({facilities:s.facilities.map(f=>f.id!==facilityId?f:{...f,services:f.services.some(x=>x.serviceId===serviceId)?f.services.map(x=>x.serviceId===serviceId?{...x,status,updatedAt:new Date().toISOString(),source:'facility_staff'}:x):[...f.services,svc(serviceId,status)]})})),saveFacility:(facility)=>set(s=>({facilities:s.facilities.some(f=>f.id===facility.id)?s.facilities.map(f=>f.id===facility.id?facility:f):[...s.facilities,facility]})),
 createEmergency:(request)=>{const item:EmergencyRequest={...request,id:`SOS-${Date.now()}`,status:'created',createdAt:new Date().toISOString()};set(s=>({emergencies:[item,...s.emergencies]}));return item.id;},updateEmergencyStatus:(id,status)=>set(s=>({emergencies:s.emergencies.map(e=>e.id===id?{...e,status}:e)})),addContact:(contact)=>set(s=>({contacts:[...s.contacts,{...contact,id:`contact-${Date.now()}`}]})),getAssignedPatients:(ashaId)=>{const ids=get().assignments.filter(a=>a.ashaId===ashaId).map(a=>a.patientId);return get().users.filter(u=>ids.includes(u.id));},addHealthRecord:(newRec)=>{const item:HealthRecord={...newRec,id:`rec-${Date.now()}`};set(s=>({healthRecords:[item,...s.healthRecords]}));return item.id;},syncPending:()=>set({pendingSync:[],lastSyncEvent:new Date().toISOString()}),resetStore:()=>set(initial()),
}),{name:'vaayu-store-v2',storage:createJSONStorage(safeStorage) }));

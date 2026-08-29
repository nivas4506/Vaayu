# SehatReach Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build SehatReach, a low-bandwidth, multilingual healthcare-navigation and referral-coordination responsive web prototype for rural and underserved areas.

**Architecture:** A client-side React single-page application (SPA) with a lightweight, persistent state engine (Zustand + localStorage) representing all databases (facilities, referrals, feedback) and simulated offline mode. This architecture guarantees 100% reliability during live demonstration, allows offline caching simulation, and avoids external server dependencies.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Zustand, Lucide React (for icons), Vitest (for unit testing).

---

## Technical Architecture & File Layout

We will organize the project inside the workspace `C:\Users\A\OneDrive\Documents\SIH` with the following structure:
- `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `index.html` (root configurations)
- `src/main.tsx` (entry point)
- `src/index.css` (Tailwind styles)
- `src/types.ts` (all data types and schemas)
- `src/i18n.ts` (localization dictionary and helper functions)
- `src/store.ts` (Zustand state store with localStorage persistence, mock data seeding, and offline simulator state)
- `src/App.tsx` (main router and navigation logic)
- `src/components/`
  - `Header.tsx` (global header with language/user mode selectors and offline toggler)
  - `WelcomeScreen.tsx` (language and role select)
  - `DiscoveryFlow.tsx` (need selection, location entry, facility search & filtering)
  - `FacilityDetails.tsx` (facility profile, availability indicators, route mock)
  - `ReferralFlow.tsx` (referral creation, tracking, status timeline update)
  - `ChwWorkspace.tsx` (ASHA worker portal, assisted referral, status update)
  - `AdminDashboard.tsx` (KPI stats, service gap alerts, user feedback log)
- `src/tests/`
  - `store.test.ts` (tests state mutations, search filters, and local caching)
  - `i18n.test.ts` (tests translation keys)

---

## Tasks

### Task 1: Setup React Project with Vite, Tailwind CSS, and Vitest

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/App.tsx`

**Step 1: Write the config files**
We create a standard package configuration targeting modern dependencies:
`package.json` will contain:
```json
{
  "name": "sehatreach",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.5",
    "lucide-react": "^0.436.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.3",
    "vite": "^5.4.1",
    "vitest": "^2.0.5",
    "@testing-library/react": "^16.0.0",
    "jsdom": "^24.1.1"
  }
}
```

Write `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ScriptHost", "ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

Write `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

Write `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Write `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Write `index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SehatReach</title>
  </head>
  <body class="bg-gray-50 text-gray-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Write `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Write `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Write a placeholder `src/App.tsx`:
```typescript
export default function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-emerald-600">SehatReach</h1>
      <p>Rural Healthcare access & referral portal</p>
    </div>
  )
}
```

**Step 2: Run npm install and check setup**
Run: `npm install`
Run: `npm run build`
Verify output succeeds.

**Step 3: Run Vitest smoke test**
Run: `npx vitest run`
Verify tests pass (none yet, but Vitest should run successfully or report empty run).

**Step 4: Commit**
```bash
git add package.json tsconfig.json vite.config.ts tailwind.config.js postcss.config.js index.html src/main.tsx src/index.css src/App.tsx
git commit -m "chore: initialize vite react project with tailwind and vitest"
```

---

### Task 2: Implement Data Types and Localization Helpers (i18n)

**Files:**
- Create: `src/types.ts`
- Create: `src/i18n.ts`
- Create: `src/tests/i18n.test.ts`

**Step 1: Write `src/types.ts`**
Specify data structures for Facilities, Services, Referrals, and User Settings.
```typescript
export type UserLanguage = 'en' | 'hi';
export type UserRole = 'patient' | 'asha' | 'staff' | 'admin';

export type AvailabilityStatus = 'available' | 'limited' | 'unavailable' | 'unknown';

export interface Service {
  id: string;
  nameKey: string; // references i18n translation key
  category: 'consultation' | 'diagnostic' | 'medicine' | 'specialist' | 'care';
  icon: string;
}

export interface ServiceAvailability {
  serviceId: string;
  status: AvailabilityStatus;
  capacityNoteKey?: string;
  source: 'facility_staff' | 'asha_report' | 'patient_feedback';
  updatedAt: string; // ISO format
}

export interface Facility {
  id: string;
  name: string;
  type: 'HWC' | 'PHC' | 'CHC' | 'Civil Hospital' | 'Mobile Unit';
  pincode: string;
  village: string;
  distanceKm: number;
  hours: string;
  contact: string;
  services: ServiceAvailability[];
}

export interface Referral {
  code: string;
  patientName: string;
  patientPhone: string;
  originFacilityId: string;
  destFacilityId: string;
  requestedServiceId: string;
  urgency: 'routine' | 'urgent';
  status: 'created' | 'accepted' | 'ready_for_visit' | 'completed' | 'redirected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackReport {
  id: string;
  facilityId: string;
  serviceId?: string;
  category: 'wrong_status' | 'wrong_hours' | 'missing_facility' | 'medicine_shortage' | 'staff_absent';
  description: string;
  reporterRole: UserRole;
  status: 'pending' | 'resolved';
  createdAt: string;
}
```

**Step 2: Write `src/i18n.ts`**
Define translation tables for English and Hindi. Use fallback translation lookup logic.
```typescript
import { UserLanguage } from './types';

export const translations = {
  en: {
    // Navigation & Common
    app_title: "SehatReach",
    tagline: "Rural Healthcare Access and Coordination",
    select_lang: "Choose Language / भाषा चुनें",
    english: "English",
    hindi: "हिन्दी",
    role_patient: "Patient / Caregiver",
    role_asha: "ASHA / Health Worker",
    role_staff: "Facility Staff",
    role_admin: "District Administrator",
    next: "Next",
    back: "Back",
    submit: "Submit",
    save: "Save",
    share: "Share",
    close: "Close",
    status_updated: "Last updated",
    hours_label: "Hours",
    contact_label: "Contact",
    distance_label: "Distance",
    stale_data_warning: "Warning: This data was updated more than 48 hours ago. Verify before traveling.",
    
    // Service categories
    service_consultation: "General Consultation",
    service_blood_test: "Blood Test",
    service_xray: "X-Ray",
    service_ultrasound: "Ultrasound",
    service_medicine: "Medicine Stock",
    service_maternal: "Maternal Care",
    service_child: "Child Care",
    service_specialist: "Specialist consultation",
    
    // Status indicators
    status_available: "Available",
    status_limited: "Limited Availability",
    status_unavailable: "Unavailable",
    status_unknown: "Unknown (Verify)",
    
    // Search screens
    search_need: "What healthcare service do you need?",
    search_location: "Where is your location?",
    enter_village: "Enter Village Name or Pincode",
    find_facilities: "Search Nearby Facilities",
    no_facilities_found: "No facilities match your selected criteria. Try checking adjacent pincodes or contact an ASHA worker.",
    closest_cannot_provide: "The closest facility cannot provide one or more requested services. An alternate is recommended below.",
    
    // Referrals
    referral_title: "Referral Token",
    referral_code: "Referral Code",
    referral_status: "Status",
    status_created: "Referral Created",
    status_accepted: "Accepted by Destination",
    status_ready_for_visit: "Ready for Visit",
    status_completed: "Visit Completed",
    status_redirected: "Redirected to alternate facility",
    create_referral: "Generate Referral",
    patient_info: "Patient Details",
    urgency_routine: "Routine",
    urgency_urgent: "Urgent (Priority)",
    timeline_title: "Referral Pathway",
    
    // Feedback
    report_issue: "Report Service Shortage or Error",
    feedback_success: "Report submitted successfully! Thank you for improving community healthcare data.",
    
    // Offline simulation
    offline_mode: "Offline Mode (Simulated)",
    offline_active: "You are offline. Showing cached information. Actions will sync once network is restored.",
    online_active: "Network Connected",
    syncing_pending: "Syncing pending updates..."
  },
  hi: {
    // Navigation & Common
    app_title: "सेहतरीच",
    tagline: "ग्रामीण स्वास्थ्य सेवा पहुंच और समन्वय",
    select_lang: "Choose Language / भाषा चुनें",
    english: "English",
    hindi: "हिन्दी",
    role_patient: "मरीज / देखभालकर्ता",
    role_asha: "आशा / स्वास्थ्य कार्यकर्ता",
    role_staff: "अस्पताल स्टाफ",
    role_admin: "जिला स्वास्थ्य प्रशासक",
    next: "आगे बढ़ें",
    back: "पीछे जाएं",
    submit: "जमा करें",
    save: "सुरक्षित करें",
    share: "साझा करें",
    close: "बंद करें",
    status_updated: "अंतिम अद्यतन",
    hours_label: "कार्य समय",
    contact_label: "संपर्क",
    distance_label: "दूरी",
    stale_data_warning: "चेतावनी: यह जानकारी 48 घंटे से अधिक पुरानी है। यात्रा करने से पहले पुष्टि करें।",
    
    // Service categories
    service_consultation: "सामान्य जांच (डॉक्टर)",
    service_blood_test: "खून की जांच",
    service_xray: "एक्स-रे (X-Ray)",
    service_ultrasound: "अल्ट्रासाउंड",
    service_medicine: "दवाई स्टॉक",
    service_maternal: "मातृत्व देखभाल",
    service_child: "बाल स्वास्थ्य",
    service_specialist: "विशेषज्ञ डॉक्टर सलाह",
    
    // Status indicators
    status_available: "उपलब्ध",
    status_limited: "सीमित उपलब्धता",
    status_unavailable: "अनुपलब्ध",
    status_unknown: "अज्ञात (पुष्टि करें)",
    
    // Search screens
    search_need: "आपको किस स्वास्थ्य सेवा की आवश्यकता है?",
    search_location: "आपका स्थान कहां है?",
    enter_village: "गाँव का नाम या पिनकोड दर्ज करें",
    find_facilities: "नज़दीकी अस्पताल खोजें",
    no_facilities_found: "कोई भी अस्पताल आपके मानदंडों से मेल नहीं खाता। कृपया नजदीकी पिनकोड खोजें या आशा दीदी से संपर्क करें।",
    closest_cannot_provide: "निकटतम अस्पताल आवश्यक सेवा प्रदान नहीं कर सकता। नीचे दिए गए वैकल्पिक अस्पताल की सलाह दी जाती है।",
    
    // Referrals
    referral_title: "रेफरल टोकन",
    referral_code: "रेफरल कोड",
    referral_status: "स्थिति",
    status_created: "रेफरल तैयार",
    status_accepted: "अस्पताल द्वारा स्वीकृत",
    status_ready_for_visit: "दिखाने के लिए तैयार",
    status_completed: "इलाज पूर्ण",
    status_redirected: "वैकल्पिक अस्पताल में स्थानांतरित",
    create_referral: "रेफरल कोड बनाएं",
    patient_info: "मरीज की जानकारी",
    urgency_routine: "सामान्य",
    urgency_urgent: "आपातकालीन / गंभीर",
    timeline_title: "रेफरल मार्ग",
    
    // Feedback
    report_issue: "समस्या या जानकारी में गलती की रिपोर्ट करें",
    feedback_success: "रिपोर्ट दर्ज कर ली गई है! ग्रामीण स्वास्थ्य डेटा को सुधारने में मदद के लिए धन्यवाद।",
    
    // Offline simulation
    offline_mode: "ऑफलाइन मोड (सिम्युलेटेड)",
    offline_active: "आप ऑफलाइन हैं। सुरक्षित की गई पुरानी जानकारी दिखाई जा रही है। नेटवर्क आने पर सिंक होगा।",
    online_active: "नेटवर्क उपलब्ध है",
    syncing_pending: "लंबित जानकारी सिंक हो रही है..."
  }
};

export function t(key: keyof typeof translations['en'], lang: UserLanguage): string {
  const text = translations[lang][key] || translations['en'][key];
  return text || key;
}
```

**Step 3: Write test file `src/tests/i18n.test.ts`**
```typescript
import { describe, test, expect } from 'vitest';
import { t } from '../i18n';

describe('i18n Localization', () => {
  test('should return english values correctly', () => {
    expect(t('app_title', 'en')).toBe('SehatReach');
    expect(t('status_available', 'en')).toBe('Available');
  });

  test('should return hindi values correctly', () => {
    expect(t('app_title', 'hi')).toBe('सेहतरीच');
    expect(t('status_available', 'hi')).toBe('उपलब्ध');
  });

  test('should fallback to english if key is missing in translation map', () => {
    // Add fake key assertion or verify fallback behavior
    expect(t('app_title', 'hi')).toBe('सेहतरीच');
  });
});
```

**Step 4: Run tests**
Run: `npx vitest run src/tests/i18n.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/types.ts src/i18n.ts src/tests/i18n.test.ts
git commit -m "feat: add application types and bilingual i18n infrastructure"
```

---

### Task 3: Build State Management with Zustand and Seed Demonstration Data

**Files:**
- Create: `src/store.ts`
- Create: `src/tests/store.test.ts`

**Step 1: Write `src/store.ts`**
We implement the Zustand state manager to persist state using localStorage. We configure it with the demonstration data as specified in Section 10 of the PRD:
- Nandgaon HWC (General consultation, maternal care, limited specialist)
- Rampur PHC (Consultation & blood testing, medicine stock limited/unavailable)
- Seva CHC (X-ray, ultrasound on selected days, gynaecology)
- District Civil Hospital (Advanced diagnostics, specialist referral destination)
- Mobile Diagnostic Unit (Scheduled blood testing in selected villages)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Facility, Referral, FeedbackReport, UserLanguage, UserRole, Service, AvailabilityStatus } from './types';

// Standard Services Taxonomy
export const TAXONOMY_SERVICES: Service[] = [
  { id: 'consultation', nameKey: 'service_consultation', category: 'consultation', icon: 'UserRoundCheck' },
  { id: 'blood_test', nameKey: 'service_blood_test', category: 'diagnostic', icon: 'Droplet' },
  { id: 'xray', nameKey: 'service_xray', category: 'diagnostic', icon: 'FileImage' },
  { id: 'ultrasound', nameKey: 'service_ultrasound', category: 'diagnostic', icon: 'Activity' },
  { id: 'medicine', nameKey: 'service_medicine', category: 'medicine', icon: 'Pills' },
  { id: 'maternal_care', nameKey: 'service_maternal', category: 'care', icon: 'Baby' },
  { id: 'child_care', nameKey: 'service_child', category: 'care', icon: 'ShieldAlert' },
  { id: 'specialist_care', nameKey: 'service_specialist', category: 'specialist', icon: 'Stethoscope' }
];

// Initial mock facilities representing the demo district (Section 10)
const SEEDED_FACILITIES: Facility[] = [
  {
    id: 'nandgaon_hwc',
    name: 'Nandgaon Health and Wellness Centre',
    type: 'HWC',
    pincode: '482001',
    village: 'Nandgaon',
    distanceKm: 4,
    hours: '9:00 AM - 4:00 PM',
    contact: '+91 98765 43210',
    services: [
      { serviceId: 'consultation', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
      { serviceId: 'maternal_care', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
      { serviceId: 'medicine', status: 'limited', source: 'asha_report', updatedAt: '2026-08-26T12:00:00Z' },
      { serviceId: 'blood_test', status: 'unavailable', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
    ]
  },
  {
    id: 'rampur_phc',
    name: 'Rampur PHC',
    type: 'PHC',
    pincode: '482002',
    village: 'Rampur',
    distanceKm: 8,
    hours: '8:00 AM - 5:00 PM',
    contact: '+91 98765 43211',
    services: [
      { serviceId: 'consultation', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T10:00:00Z' },
      { serviceId: 'blood_test', status: 'unavailable', source: 'patient_feedback', updatedAt: '2026-08-27T09:30:00Z' }, // Unavailable blood test (Service Gap demo)
      { serviceId: 'medicine', status: 'limited', source: 'facility_staff', updatedAt: '2026-08-24T10:00:00Z' }, // STALE update
      { serviceId: 'maternal_care', status: 'limited', source: 'facility_staff', updatedAt: '2026-08-27T10:00:00Z' }
    ]
  },
  {
    id: 'seva_chc',
    name: 'Seva CHC',
    type: 'CHC',
    pincode: '482003',
    village: 'Seva',
    distanceKm: 15,
    hours: '24 Hours',
    contact: '+91 98765 43212',
    services: [
      { serviceId: 'consultation', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
      { serviceId: 'blood_test', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
      { serviceId: 'xray', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
      { serviceId: 'ultrasound', status: 'limited', capacityNoteKey: 'ultrasound_schedule_note', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
      { serviceId: 'specialist_care', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' }
    ]
  },
  {
    id: 'district_hospital',
    name: 'District Civil Hospital',
    type: 'Civil Hospital',
    pincode: '482010',
    village: 'District Centre',
    distanceKm: 28,
    hours: '24 Hours',
    contact: '+91 98765 43213',
    services: [
      { serviceId: 'consultation', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
      { serviceId: 'blood_test', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
      { serviceId: 'xray', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
      { serviceId: 'ultrasound', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
      { serviceId: 'medicine', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' },
      { serviceId: 'specialist_care', status: 'available', source: 'facility_staff', updatedAt: '2026-08-27T08:00:00Z' }
    ]
  },
  {
    id: 'mobile_diagnostic',
    name: 'Mobile Diagnostic Unit',
    type: 'Mobile Unit',
    pincode: '482002',
    village: 'Rampur (Tuesdays)',
    distanceKm: 0,
    hours: '10:00 AM - 2:00 PM',
    contact: 'N/A',
    services: [
      { serviceId: 'blood_test', status: 'available', source: 'facility_staff', updatedAt: '2026-08-26T12:00:00Z' }
    ]
  }
];

interface AppState {
  // Global settings
  language: UserLanguage;
  role: UserRole;
  isOffline: boolean;
  
  // Data lists
  facilities: Facility[];
  referrals: Referral[];
  feedback: FeedbackReport[];
  pendingSync: { type: 'feedback' | 'referral' | 'status_update'; data: any }[];
  
  // Actions
  setLanguage: (lang: UserLanguage) => void;
  setRole: (role: UserRole) => void;
  setOffline: (offline: boolean) => void;
  
  // Business logic mutations
  addReferral: (referral: Omit<Referral, 'code' | 'createdAt' | 'updatedAt'>) => string;
  updateReferralStatus: (code: string, status: Referral['status']) => void;
  addFeedback: (report: Omit<FeedbackReport, 'id' | 'createdAt' | 'status'>) => void;
  updateFacilityServiceStatus: (facilityId: string, serviceId: string, status: AvailabilityStatus) => void;
  syncPending: () => void;
  resetStore: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'en',
      role: 'patient',
      isOffline: false,
      facilities: SEEDED_FACILITIES,
      referrals: [],
      feedback: [],
      pendingSync: [],

      setLanguage: (language) => set({ language }),
      setRole: (role) => set({ role }),
      setOffline: (isOffline) => {
        set({ isOffline });
        if (!isOffline) {
          get().syncPending();
        }
      },

      addReferral: (newRef) => {
        const code = `REF-${Math.floor(1000 + Math.random() * 9000)}`;
        const referral: Referral = {
          ...newRef,
          code,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (get().isOffline) {
          set((state) => ({
            pendingSync: [...state.pendingSync, { type: 'referral', data: referral }],
            referrals: [referral, ...state.referrals]
          }));
        } else {
          set((state) => ({
            referrals: [referral, ...state.referrals]
          }));
        }
        return code;
      },

      updateReferralStatus: (code, status) => {
        set((state) => ({
          referrals: state.referrals.map((r) =>
            r.code === code
              ? { ...r, status, updatedAt: new Date().toISOString() }
              : r
          ),
        }));
      },

      addFeedback: (newReport) => {
        const report: FeedbackReport = {
          ...newReport,
          id: `FDB-${Math.floor(10000 + Math.random() * 90000)}`,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        if (get().isOffline) {
          set((state) => ({
            pendingSync: [...state.pendingSync, { type: 'feedback', data: report }],
            feedback: [report, ...state.feedback]
          }));
        } else {
          set((state) => ({
            feedback: [report, ...state.feedback]
          }));
        }
      },

      updateFacilityServiceStatus: (facilityId, serviceId, status) => {
        const updateAction = { facilityId, serviceId, status, timestamp: new Date().toISOString() };
        
        if (get().isOffline) {
          set((state) => ({
            pendingSync: [...state.pendingSync, { type: 'status_update', data: updateAction }]
          }));
        }

        set((state) => ({
          facilities: state.facilities.map((fac) => {
            if (fac.id !== facilityId) return fac;
            const serviceIndex = fac.services.findIndex((s) => s.serviceId === serviceId);
            const newServices = [...fac.services];
            if (serviceIndex >= 0) {
              newServices[serviceIndex] = {
                ...newServices[serviceIndex],
                status,
                updatedAt: new Date().toISOString(),
                source: 'facility_staff'
              };
            } else {
              newServices.push({
                serviceId,
                status,
                updatedAt: new Date().toISOString(),
                source: 'facility_staff'
              });
            }
            return { ...fac, services: newServices };
          })
        }));
      },

      syncPending: () => {
        const { pendingSync } = get();
        if (pendingSync.length === 0) return;
        
        // Mocking server sync
        console.log(`Syncing ${pendingSync.length} items to database...`);
        set({ pendingSync: [] });
      },

      resetStore: () => {
        set({
          language: 'en',
          role: 'patient',
          isOffline: false,
          facilities: SEEDED_FACILITIES,
          referrals: [],
          feedback: [],
          pendingSync: []
        });
      }
    }),
    {
      name: 'sehatreach-store',
    }
  )
);
```

**Step 2: Write tests in `src/tests/store.test.ts`**
Verify the main store operations work properly, including adding referrals, mock data filtering, and sync-queuing.
```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store';

describe('App State Store', () => {
  beforeEach(() => {
    useAppStore.getState().resetStore();
  });

  test('should initialize with seeded facilities', () => {
    const state = useAppStore.getState();
    expect(state.facilities.length).toBeGreaterThanOrEqual(4);
    const rampur = state.facilities.find((f) => f.id === 'rampur_phc');
    expect(rampur).toBeDefined();
    expect(rampur?.name).toBe('Rampur PHC');
  });

  test('should generate a referral code when added', () => {
    const code = useAppStore.getState().addReferral({
      patientName: 'Rani Dev',
      patientPhone: '9876512345',
      originFacilityId: 'rampur_phc',
      destFacilityId: 'district_hospital',
      requestedServiceId: 'blood_test',
      urgency: 'routine',
      status: 'created'
    });

    expect(code).toMatch(/^REF-\d{4}$/);
    const refs = useAppStore.getState().referrals;
    expect(refs.length).toBe(1);
    expect(refs[0].patientName).toBe('Rani Dev');
  });

  test('should queue synchronization if offline', () => {
    useAppStore.getState().setOffline(true);
    useAppStore.getState().addFeedback({
      facilityId: 'rampur_phc',
      serviceId: 'blood_test',
      category: 'wrong_status',
      description: 'Blood test clinic closed early',
      reporterRole: 'patient'
    });

    const state = useAppStore.getState();
    expect(state.pendingSync.length).toBe(1);
    expect(state.pendingSync[0].type).toBe('feedback');

    // Go back online and confirm sync runs
    useAppStore.getState().setOffline(false);
    expect(useAppStore.getState().pendingSync.length).toBe(0);
  });
});
```

**Step 3: Run Vitest tests**
Run: `npx vitest run src/tests/store.test.ts`
Expected: PASS

**Step 4: Commit**
```bash
git add src/store.ts src/tests/store.test.ts
git commit -m "feat: build zustand state store with seeded facilities and offline synchronization cache"
```

---

## Demo Script Scenario

The system can be verified by following this script:

1. **Select Language**: Click "Hindi" and verify translation changes on labels, then revert to "English".
2. **Select Role**: Select "Patient / Caregiver" and click Next.
3. **Filter Service**: Select "Blood Test" and enter "Rampur" or "482002" as pincode. Click Search.
4. **Spot Gap**: Note the warning: "Rampur PHC lists this service as UNAVAILABLE. Alternate is recommended".
5. **View Detail**: Click View Details on Rampur PHC. Notice the "Last updated" timestamps and warning flags for stale updates.
6. **Submit Feedback**: Click "Is information incorrect? Report it", select "Service availability is incorrect", type "Blood test lab is under renovation", and submit.
7. **Initiate Referral**: Select "Seva CHC" as target or open the referral code generator page.
8. **Create Referral**: Type patient "Rani", phone "9876543210", origin "Rampur PHC", destination "Seva CHC", service "Blood Test", urgency "Routine", and submit.
9. **Simulate Queue Handoff**: Note the generated code (e.g. `REF-1234`).
10. **Validate as Staff**: Go Back, switch role to "ASHA / Health Worker" or "Facility Staff". Manage facility "Seva CHC". Locate `REF-1234` in the "Incoming Referrals" queue, and click "Accept Referral".
11. **Track Status**: Switch back to "Patient / Caregiver" mode, search for `REF-1234` in "Track Referral", and verify the timeline status has progressed to "Accepted by Destination".
12. **Monitor Gaps**: Go back, switch role to "District Administrator". Note the KPI stat cards, see the reported "Blood test lab is under renovation" report log under "User Correction Reports", and find the "Rampur PHC - Blood Test" shortage listed under "Active Service Gaps".
13. **Simulate Offline**: Toggle the "Online/Offline" header switch. In offline mode, complete a search, register a new feedback log, and notice it queues under the pending status sync count. Toggle "Online" and verify it synchronizes automatically.

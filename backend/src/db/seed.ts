import { db, initDatabase } from './client.js';

export async function seedDatabase() {
  console.log('Seeding Vaayu PostgreSQL Database...');
  await initDatabase();

  // Clean tables
  await db.exec('DELETE FROM audit_events;');
  await db.exec('DELETE FROM feedback_reports;');
  await db.exec('DELETE FROM referral_events;');
  await db.exec('DELETE FROM referrals;');
  await db.exec('DELETE FROM current_availability;');
  await db.exec('DELETE FROM availability_updates;');
  await db.exec('DELETE FROM facility_services;');
  await db.exec('DELETE FROM services;');
  await db.exec('DELETE FROM facilities;');
  await db.exec('DELETE FROM users;');

  // 1. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, role, phone_hash, preferred_language, status, created_at)
    VALUES (?, ?, ?, ?, 'ACTIVE', ?)
  `);

  const now = new Date().toISOString();
  const threeDaysAgo = new Date(Date.now() - 72 * 3600 * 1000).toISOString();

  await insertUser.run('usr_asha_01', 'ASHA', 'hash_asha_01', 'hi', now);
  await insertUser.run('usr_staff_rampur', 'FACILITY_STAFF', 'hash_staff_01', 'hi', now);
  await insertUser.run('usr_admin_01', 'DISTRICT_ADMIN', 'hash_admin_01', 'en', now);

  // 2. Seed Services
  const insertService = db.prepare(`
    INSERT INTO services (id, category, key, icon, active)
    VALUES (?, ?, ?, ?, ?)
  `);

  const servicesData = [
    { id: 'consultation', category: 'General', key: 'general_consultation', icon: 'stethoscope', active: true },
    { id: 'maternal_care', category: 'Maternal', key: 'anc_checkup', icon: 'baby', active: true },
    { id: 'immunization', category: 'Pediatric', key: 'routine_vaccines', icon: 'syringe', active: true },
    { id: 'blood_test', category: 'Diagnostic', key: 'cbc_blood_test', icon: 'droplet', active: true },
    { id: 'xray', category: 'Diagnostic', key: 'chest_xray', icon: 'activity', active: true },
    { id: 'emergency_triage', category: 'Emergency', key: 'trauma_stabilization', icon: 'alert-triangle', active: true },
    { id: 'icu_bed', category: 'Inpatient', key: 'icu_bed_avail', icon: 'bed', active: true },
    { id: 'ambulance', category: 'Transport', key: 'emergency_transport', icon: 'truck', active: true }
  ];

  for (const s of servicesData) {
    await insertService.run(s.id, s.category, s.key, s.icon, s.active);
  }

  // 3. Seed Facilities
  const insertFacility = db.prepare(`
    INSERT INTO facilities (id, name, type, pincode, village, address, latitude, longitude, hours, contact, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
  `);

  const facilitiesData = [
    {
      id: 'nandgaon_hwc',
      name: 'Nandgaon Health & Wellness Centre',
      type: 'HWC',
      pincode: '482001',
      village: 'Nandgaon',
      address: 'Main Road, Near Panchayat Bhawan, Nandgaon',
      latitude: 23.1815,
      longitude: 79.9864,
      hours: '9:00 AM - 4:00 PM',
      contact: '+91 98765 43210'
    },
    {
      id: 'rampur_phc',
      name: 'Rampur PHC',
      type: 'PHC',
      pincode: '482002',
      village: 'Rampur',
      address: 'Station Road, Opposite Govt School, Rampur',
      latitude: 23.2045,
      longitude: 80.0012,
      hours: '24 Hours',
      contact: '+91 98765 43211'
    },
    {
      id: 'seva_chc',
      name: 'Seva Community Health Centre',
      type: 'CHC',
      pincode: '482003',
      village: 'Sevanagar',
      address: 'Hospital Square, Sevanagar Block',
      latitude: 23.2210,
      longitude: 80.0345,
      hours: '24 Hours',
      contact: '+91 98765 43212'
    },
    {
      id: 'district_civil_hosp',
      name: 'District Civil Hospital Jabalpur',
      type: 'DH',
      pincode: '482004',
      village: 'Jabalpur City',
      address: 'Civil Lines, Medical College Road, Jabalpur',
      latitude: 23.1600,
      longitude: 79.9500,
      hours: '24 Hours Emergency',
      contact: '+91 98765 43213'
    },
    {
      id: 'mobile_unit_01',
      name: 'District Mobile Diagnostic Unit 01',
      type: 'MOBILE_UNIT',
      pincode: '482002',
      village: 'Rampur (Tuesdays)',
      address: 'Mobile Van, Rampur Bus Stand',
      latitude: 23.2110,
      longitude: 80.0125,
      hours: '10:00 AM - 2:00 PM',
      contact: '+91 98765 43214'
    }
  ];

  for (const f of facilitiesData) {
    await insertFacility.run(f.id, f.name, f.type, f.pincode, f.village, f.address, f.latitude, f.longitude, f.hours, f.contact, now);
  }

  // 4. Seed Current Availability & History
  const insertAvail = db.prepare(`
    INSERT INTO current_availability (facility_id, service_id, status, source, confidence, capacity_note, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAvailHistory = db.prepare(`
    INSERT INTO availability_updates (id, facility_id, service_id, status, source, confidence, updated_by, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const availabilityRecords = [
    { facility_id: 'nandgaon_hwc', service_id: 'consultation', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: null, updated_at: now },
    { facility_id: 'nandgaon_hwc', service_id: 'maternal_care', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: null, updated_at: now },
    { facility_id: 'nandgaon_hwc', service_id: 'immunization', status: 'LIMITED', source: 'FACILITY_REPORTED', confidence: 0.8, capacity_note: 'Vaccine stock low', updated_at: now },
    { facility_id: 'nandgaon_hwc', service_id: 'blood_test', status: 'UNAVAILABLE', source: 'PATIENT_FEEDBACK', confidence: 0.6, capacity_note: 'No lab tech', updated_at: now },
    { facility_id: 'rampur_phc', service_id: 'consultation', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: null, updated_at: now },
    { facility_id: 'rampur_phc', service_id: 'maternal_care', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: null, updated_at: now },
    { facility_id: 'rampur_phc', service_id: 'blood_test', status: 'UNAVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: 'Reagent shortage', updated_at: threeDaysAgo },
    { facility_id: 'rampur_phc', service_id: 'emergency_triage', status: 'LIMITED', source: 'FACILITY_REPORTED', confidence: 0.9, capacity_note: '1 MO on duty', updated_at: now },
    { facility_id: 'seva_chc', service_id: 'consultation', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: null, updated_at: now },
    { facility_id: 'seva_chc', service_id: 'blood_test', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: '24/7 Lab active', updated_at: now },
    { facility_id: 'seva_chc', service_id: 'xray', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: null, updated_at: now },
    { facility_id: 'seva_chc', service_id: 'emergency_triage', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: null, updated_at: now },
    { facility_id: 'district_civil_hosp', service_id: 'consultation', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: null, updated_at: now },
    { facility_id: 'district_civil_hosp', service_id: 'blood_test', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: null, updated_at: now },
    { facility_id: 'district_civil_hosp', service_id: 'xray', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: null, updated_at: now },
    { facility_id: 'district_civil_hosp', service_id: 'icu_bed', status: 'LIMITED', source: 'FACILITY_REPORTED', confidence: 0.9, capacity_note: '2 beds remaining', updated_at: now },
    { facility_id: 'district_civil_hosp', service_id: 'ambulance', status: 'AVAILABLE', source: 'FACILITY_REPORTED', confidence: 1.0, capacity_note: '3 ALS units ready', updated_at: now }
  ];

  let histId = 1;
  for (const a of availabilityRecords) {
    await insertAvail.run(a.facility_id, a.service_id, a.status, a.source, a.confidence, a.capacity_note, a.updated_at);
    await insertAvailHistory.run(`hist_${histId++}`, a.facility_id, a.service_id, a.status, a.source, a.confidence, 'usr_staff_rampur', a.updated_at);
  }

  // 5. Seed Referrals
  const insertReferral = db.prepare(`
    INSERT INTO referrals (id, public_code, origin_facility_id, dest_facility_id, service_id, patient_name, patient_phone, urgency, status, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRefEvent = db.prepare(`
    INSERT INTO referral_events (id, referral_id, from_status, to_status, actor_id, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  await insertReferral.run(
    'ref_001',
    'REF-4821',
    'rampur_phc',
    'seva_chc',
    'blood_test',
    'Rani Dev',
    '+91 98765 12345',
    'ROUTINE',
    'ACCEPTED',
    'Referred due to Rampur PHC lab renovation',
    now,
    now
  );

  await insertRefEvent.run('evt_01', 'ref_001', null, 'CREATED', 'usr_asha_01', 'Initial referral creation', now);
  await insertRefEvent.run('evt_02', 'ref_001', 'CREATED', 'ACCEPTED', 'usr_staff_rampur', 'Accepted by Seva CHC desk', now);

  // 6. Seed Feedback Reports
  const insertFeedback = db.prepare(`
    INSERT INTO feedback_reports (id, facility_id, service_id, category, description, reporter_role, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  await insertFeedback.run(
    'fdb_001',
    'rampur_phc',
    'blood_test',
    'wrong_status',
    'Blood test lab closed today for renovation work',
    'PATIENT',
    'PENDING',
    now
  );

  console.log('Vaayu PostgreSQL Database seeded successfully!');
}

seedDatabase();


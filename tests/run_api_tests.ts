import request from 'supertest';
import { app } from '../backend/src/app.js';
import { seedDatabase } from '../backend/src/db/seed.js';

async function run() {
  console.log("🌱 Seeding database...");
  seedDatabase();

  console.log("\n=== 1. Health Check [GET /api/v1/health] ===");
  const healthRes = await request(app).get('/api/v1/health');
  console.log(JSON.stringify(healthRes.body, null, 2));

  console.log("\n=== 2. Services Taxonomy [GET /api/v1/services] ===");
  const servicesRes = await request(app).get('/api/v1/services');
  console.log(JSON.stringify(servicesRes.body, null, 2));

  console.log("\n=== 3. PIN Code Directory Lookup [GET /api/v1/pincode/482002] ===");
  const pincodeRes = await request(app).get('/api/v1/pincode/482002');
  console.log(JSON.stringify(pincodeRes.body, null, 2));

  console.log("\n=== 4. Facility Discovery & Mappls Caching [GET /api/v1/discover] ===");
  const discoverRes = await request(app).get('/api/v1/discover?need=blood_test&pincode=482002');
  console.log(JSON.stringify(discoverRes.body, null, 2));

  console.log("\n=== 5. Emergency SOS Dispatch [POST /api/v1/sos/trigger] ===");
  const sosTriggerRes = await request(app)
    .post('/api/v1/sos/trigger')
    .set('x-user-role', 'PATIENT')
    .send({ latitude: 23.2120, longitude: 80.0150 });
  console.log(JSON.stringify(sosTriggerRes.body, null, 2));

  const sosId = sosTriggerRes.body.data.id;

  console.log(`\n=== 6. Emergency SOS Status [GET /api/v1/sos/status/${sosId}] ===`);
  const sosStatusRes = await request(app).get(`/api/v1/sos/status/${sosId}`);
  console.log(JSON.stringify(sosStatusRes.body, null, 2));

  console.log("\n=== 7. Referral Coordination Creation [POST /api/v1/referrals] ===");
  const refCreateRes = await request(app)
    .post('/api/v1/referrals')
    .set('x-user-role', 'ASHA')
    .send({
      originFacilityId: 'rampur_phc',
      destFacilityId: 'seva_chc',
      serviceId: 'blood_test',
      patientName: 'Rani Dev',
      patientPhone: '+91 98765 12345',
      urgency: 'ROUTINE',
      notes: 'Assisted ASHA referral'
    });
  console.log(JSON.stringify(refCreateRes.body, null, 2));

  const refCode = refCreateRes.body.data.public_code;

  console.log(`\n=== 8. Referral Status Timeline [GET /api/v1/referrals/${refCode}] ===`);
  const refGetRes = await request(app).get(`/api/v1/referrals/${refCode}`);
  console.log(JSON.stringify(refGetRes.body, null, 2));

  console.log("\n=== 9. Facility Capacity Update [POST /api/v1/availability-updates] ===");
  const availRes = await request(app)
    .post('/api/v1/availability-updates')
    .set('x-user-role', 'FACILITY_STAFF')
    .send({
      facilityId: 'rampur_phc',
      serviceId: 'blood_test',
      status: 'AVAILABLE',
      capacityNote: 'Lab technician returned, reagents restocked'
    });
  console.log(JSON.stringify(availRes.body, null, 2));

  console.log("\n=== 10. Public Crowdsourced Feedback [POST /api/v1/feedback] ===");
  const fbRes = await request(app)
    .post('/api/v1/feedback')
    .send({
      facilityId: 'rampur_phc',
      serviceId: 'blood_test',
      category: 'medicine_shortage',
      description: 'Reported shortage of diagnostic vials.'
    });
  console.log(JSON.stringify(fbRes.body, null, 2));

  console.log("\n=== 11. Admin KPIs Analytics Dashboard [GET /api/v1/admin/metrics] ===");
  const adminMetricsRes = await request(app)
    .get('/api/v1/admin/metrics')
    .set('x-user-role', 'ADMIN');
  console.log(JSON.stringify(adminMetricsRes.body, null, 2));

  console.log("\n=== 12. Admin Issues & Gaps Report [GET /api/v1/admin/issues] ===");
  const adminIssuesRes = await request(app)
    .get('/api/v1/admin/issues')
    .set('x-user-role', 'ADMIN');
  console.log(JSON.stringify(adminIssuesRes.body, null, 2));
}

run().catch(console.error);

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../backend/src/app.js';
import { seedDatabase } from '../backend/src/db/seed.js';

describe('Referral Coordination API (/api/v1/referrals)', () => {
  beforeEach(() => {
    seedDatabase();
  });

  it('should create a referral with a REF-XXXX public code', async () => {
    const res = await request(app)
      .post('/api/v1/referrals')
      .set('x-user-role', 'ASHA')
      .send({
        originFacilityId: 'rampur_phc',
        destFacilityId: 'seva_chc',
        serviceId: 'blood_test',
        patientName: 'Rani Dev',
        patientPhone: '+91 98765 12345',
        urgency: 'ROUTINE',
        notes: 'Testing referral creation'
      })
      .expect(201);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.public_code).toMatch(/^REF-\d{4}$/);
    expect(res.body.data.status).toBe('CREATED');
    expect(res.body.data.timeline.length).toBeGreaterThan(0);
  });

  it('should retrieve a referral by public code', async () => {
    const res = await request(app)
      .get('/api/v1/referrals/REF-4821')
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.patient_name).toBe('Rani Dev');
    expect(res.body.data.timeline).toBeDefined();
  });

  it('should transition referral status through valid state machine', async () => {
    // Transition REF-4821 from ACCEPTED -> READY_FOR_VISIT
    const res = await request(app)
      .patch('/api/v1/referrals/REF-4821/status')
      .set('x-user-role', 'FACILITY_STAFF')
      .send({
        status: 'READY_FOR_VISIT',
        reason: 'Patient arrived at facility desk'
      })
      .expect(200);

    expect(res.body.data.status).toBe('READY_FOR_VISIT');
  });

  it('should reject invalid state transitions', async () => {
    // Attempt invalid transition CREATED -> COMPLETED directly
    const createRes = await request(app)
      .post('/api/v1/referrals')
      .set('x-user-role', 'ASHA')
      .send({
        originFacilityId: 'nandgaon_hwc',
        destFacilityId: 'seva_chc',
        serviceId: 'consultation',
        patientName: 'Test Patient',
        patientPhone: '+91 99999 00000',
        urgency: 'ROUTINE'
      })
      .expect(201);

    const code = createRes.body.data.public_code;

    const invalidRes = await request(app)
      .patch(`/api/v1/referrals/${code}/status`)
      .set('x-user-role', 'FACILITY_STAFF')
      .send({ status: 'COMPLETED' })
      .expect(500);

    expect(invalidRes.body.error.message).toContain('Invalid state transition');
  });
});

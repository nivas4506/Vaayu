import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../backend/src/app.js';
import { seedDatabase } from '../backend/src/db/seed.js';

describe('Emergency & SOS API (/api/v1/sos)', () => {
  beforeEach(async () => {
    await seedDatabase();
  });

  it('should trigger SOS and assign a nearby ambulance successfully', async () => {
    const res = await request(app)
      .post('/api/v1/sos/trigger')
      .set('x-user-role', 'PATIENT')
      .send({
        latitude: 23.2120,
        longitude: 80.0150
      })
      .expect(201);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toMatch(/^sos_\d+_\d+$/);
    expect(res.body.data.status).toBe('TRIGGERED');
    expect(res.body.data.ambulance_id).toBeDefined();
    expect(res.body.data.latitude).toBe(23.2120);
    expect(res.body.data.longitude).toBe(80.0150);
  });

  it('should retrieve SOS trigger status by ID', async () => {
    // 1. Create a trigger
    const createRes = await request(app)
      .post('/api/v1/sos/trigger')
      .set('x-user-role', 'ASHA')
      .send({
        latitude: 23.2100,
        longitude: 80.0120
      })
      .expect(201);

    const sosId = createRes.body.data.id;

    // 2. Fetch it
    const getRes = await request(app)
      .get(`/api/v1/sos/status/${sosId}`)
      .expect(200);

    expect(getRes.body.data).toBeDefined();
    expect(getRes.body.data.id).toBe(sosId);
    expect(getRes.body.data.reporter_role).toBe('ASHA');
  });

  it('should return 404 for non-existent SOS ID', async () => {
    await request(app)
      .get('/api/v1/sos/status/sos_nonexistent_999')
      .expect(404);
  });
});

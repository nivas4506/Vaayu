import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../backend/src/app.js';
import { seedDatabase } from '../backend/src/db/seed.js';

describe('Discovery & Ranking API (GET /api/v1/discover)', () => {
  beforeEach(() => {
    seedDatabase();
  });

  it('should return ranked facilities for a service request', async () => {
    const res = await request(app)
      .get('/api/v1/discover?need=consultation&pincode=482002')
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.results.length).toBeGreaterThan(0);
    expect(res.body.data.results[0].score).toBeGreaterThan(0);
    expect(res.body.data.results[0].facilityId).toBeDefined();
  });

  it('should detect service gap when nearest facility has unavailable service', async () => {
    // Request blood_test near Rampur (where Rampur PHC blood test is UNAVAILABLE)
    const res = await request(app)
      .get('/api/v1/discover?need=blood_test&lat=23.2100&lng=80.0120')
      .expect(200);

    expect(res.body.data.serviceGapDetected).toBe(true);
    expect(res.body.data.gapDetails).toBeDefined();
    expect(res.body.data.gapDetails.closestFacility).toBe('Rampur PHC');
    expect(res.body.data.gapDetails.recommendedAlternate).toBeDefined();
  });
});

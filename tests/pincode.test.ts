import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../backend/src/app.js';
import { seedDatabase } from '../backend/src/db/seed.js';

describe('India Postal Pincode Lookup API (GET /api/v1/pincode/:code)', () => {
  beforeEach(async () => {
    await seedDatabase();
  });

  it('should lookup a valid 6-digit Indian PIN code and return district details + matching facilities', async () => {
    const res = await request(app)
      .get('/api/v1/pincode/482002')
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.pincode).toBe('482002');
    expect(res.body.data.district).toBe('Jabalpur');
    expect(res.body.data.state).toBe('Madhya Pradesh');
    expect(res.body.data.matchingFacilitiesCount).toBeGreaterThan(0);
    expect(res.body.data.matchingFacilities.some((f: any) => f.id === 'rampur_phc')).toBe(true);
  });

  it('should reject invalid PIN code formats that are not 6 digits', async () => {
    const res = await request(app)
      .get('/api/v1/pincode/123')
      .expect(400);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

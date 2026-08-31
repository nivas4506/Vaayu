import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../api/v1/[...path].js';
import pincodeApp from '../api/v1/pincode/[code].js';
import { seedDatabase } from '../backend/src/db/seed.js';

describe('Vercel API entrypoint', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it('serves backend routes under /api/v1', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.data.overallStatus).toBe('HEALTHY');
  });

  it('serves nested backend routes under /api/v1', async () => {
    const res = await request(pincodeApp).get('/api/v1/pincode/482001');

    expect(res.status).toBe(200);
    expect(res.body.data.pincode).toBe('482001');
  });
});

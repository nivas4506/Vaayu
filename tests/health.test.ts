import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../backend/src/app.js';
import { seedDatabase } from '../backend/src/db/seed.js';

describe('Health Check & Diagnostics API (/api/v1/health)', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it('should return comprehensive system health and telemetry report', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.overallStatus).toBe('HEALTHY');
    expect(res.body.data.services.database.status).toBe('HEALTHY');
    expect(res.body.data.services.pincodeDatabase.status).toBe('HEALTHY');
    expect(res.body.data.telemetry).toBeDefined();
    expect(res.body.data.telemetry.facilitiesCount).toBeGreaterThan(0);
  });

  it('should support live ping probe for database', async () => {
    const res = await request(app).post('/api/v1/health/ping/database');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ONLINE');
    expect(res.body.data.service).toContain('Database');
    expect(res.body.data.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should support live ping probe for pincode engine', async () => {
    const res = await request(app).post('/api/v1/health/ping/pincode');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ONLINE');
  });
});

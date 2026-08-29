import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../backend/src/app.js';
import { seedDatabase } from '../backend/src/db/seed.js';

describe('Admin Analytics & Issues API', () => {
  beforeEach(() => {
    seedDatabase();
  });

  it('should return admin metrics dashboard payload for ADMIN role', async () => {
    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('x-user-role', 'ADMIN')
      .expect(200);

    expect(res.body.data.overview).toBeDefined();
    expect(res.body.data.overview.totalFacilities).toBeGreaterThan(0);
    expect(res.body.data.overview.serviceGapsCount).toBeGreaterThan(0);
    expect(res.body.data.overview.dataQualityScore).toBeGreaterThanOrEqual(0);
  });

  it('should reject non-admin access to admin endpoints', async () => {
    await request(app)
      .get('/api/v1/admin/metrics')
      .set('x-user-role', 'PATIENT')
      .expect(403);
  });

  it('should return service gaps, stale updates, and pending feedback in issues report', async () => {
    const res = await request(app)
      .get('/api/v1/admin/issues')
      .set('x-user-role', 'ADMIN')
      .expect(200);

    expect(res.body.data.serviceGaps).toBeDefined();
    expect(res.body.data.staleUpdates).toBeDefined();
    expect(res.body.data.pendingFeedback).toBeDefined();
    expect(res.body.data.serviceGaps.length).toBeGreaterThan(0);
  });
});

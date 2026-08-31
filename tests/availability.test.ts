import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../backend/src/app.js';
import { seedDatabase } from '../backend/src/db/seed.js';

describe('Availability & Freshness API', () => {
  beforeEach(async () => {
    await seedDatabase();
  });

  it('should submit a facility service availability update', async () => {
    const res = await request(app)
      .post('/api/v1/availability-updates')
      .set('x-user-role', 'FACILITY_STAFF')
      .send({
        facilityId: 'rampur_phc',
        serviceId: 'blood_test',
        status: 'AVAILABLE',
        capacityNote: 'Lab renovation complete and restocked'
      })
      .expect(200);

    expect(res.body.data.status).toBe('AVAILABLE');
    expect(res.body.data.capacity_note).toBe('Lab renovation complete and restocked');

    // Verify discover endpoint now reflects the AVAILABLE status
    const discoverRes = await request(app)
      .get('/api/v1/discover?need=blood_test&pincode=482002')
      .expect(200);

    const rampurResult = discoverRes.body.data.results.find((f: any) => f.facilityId === 'rampur_phc');
    expect(rampurResult.serviceAvailability.status).toBe('AVAILABLE');
  });

  it('should process batch offline outbox sync items', async () => {
    const syncPayload = {
      items: [
        {
          type: 'feedback',
          payload: {
            facilityId: 'nandgaon_hwc',
            category: 'medicine_shortage',
            description: 'ORS packets out of stock'
          }
        },
        {
          type: 'status_update',
          payload: {
            facilityId: 'nandgaon_hwc',
            serviceId: 'medicine',
            status: 'UNAVAILABLE'
          }
        }
      ]
    };

    const res = await request(app)
      .post('/api/v1/sync')
      .send(syncPayload)
      .expect(200);

    expect(res.body.data.processed).toBe(2);
    expect(res.body.data.failed).toBe(0);
  });
});

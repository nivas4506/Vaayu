import { describe, expect, test } from 'vitest';
import { buildEmergencySms, haversineKm } from '../services/emergencyService';

describe('emergency helpers', () => {
  test('calculates an approximate Haversine distance', () => {
    expect(haversineKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 })).toBeCloseTo(111.2, 0);
  });

  test('creates a device SMS composer URL instead of sending SMS', () => {
    expect(buildEmergencySms('9876543210', 'Accident', 'Rani', { latitude: 22.7, longitude: 75.8 })).toMatch(/^sms:/);
  });
});

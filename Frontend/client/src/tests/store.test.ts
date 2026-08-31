import { describe, test, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store';

describe('App State Store', () => {
  beforeEach(() => { useAppStore.getState().resetStore(); });

  test('seeded facilities present', () => {
    const state = useAppStore.getState();
    expect(state.facilities.length).toBeGreaterThanOrEqual(4);
    expect(state.facilities.find((f) => f.id === 'jabalpur_phc')?.name).toBe('Jabalpur Primary Health Centre');
  });

  test('referral code generated', async () => {
    const code = await useAppStore.getState().addReferral({
      patientName: 'Rani Dev', patientPhone: '9876512345', originFacilityId: 'jabalpur_phc',
      destFacilityId: 'seva_chc', requestedServiceId: 'blood_test', urgency: 'routine', status: 'created'
    });
    expect(code).toMatch(/^REF-\d{4}$/);
    expect(useAppStore.getState().referrals.length).toBe(1);
  });

  test('offline queues then syncs', async () => {
    await useAppStore.getState().setOffline(true);
    await useAppStore.getState().addFeedback({ facilityId: 'jabalpur_phc', serviceId: 'blood_test', category: 'wrong_status', description: 'closed early', reporterRole: 'patient' });
    expect(useAppStore.getState().pendingSync.length).toBe(1);
    await useAppStore.getState().setOffline(false);
    expect(useAppStore.getState().pendingSync.length).toBe(0);
  });
});

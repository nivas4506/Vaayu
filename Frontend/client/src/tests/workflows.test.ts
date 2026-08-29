import { beforeEach, describe, expect, test } from 'vitest';
import { useAppStore } from '../store';

describe('demo role workflows', () => {
  beforeEach(() => useAppStore.getState().resetStore());

  test('keeps a registered ASHA worker pending until approved', () => {
    const user = useAppStore.getState().registerDemoUser({
      name: 'Asha Devi', mobile: '9999999999', email: 'newasha@vaayu.demo', password: 'demo123',
      role: 'asha', state: 'Madhya Pradesh', district: 'Jabalpur', address: 'Rampur', language: 'hi', emergencyContact: '9876543210',
    });
    expect(user.status).toBe('pending');
    useAppStore.getState().approveAsha(user.id);
    expect(useAppStore.getState().users.find((candidate) => candidate.id === user.id)?.status).toBe('active');
  });
});

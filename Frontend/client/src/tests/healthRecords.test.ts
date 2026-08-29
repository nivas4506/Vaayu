import { beforeEach, describe, expect, test } from 'vitest';
import { useAppStore } from '../store';
import { HealthRecord } from '../types';

describe('Health Records and Role-Based Workflows', () => {
  beforeEach(() => {
    useAppStore.getState().resetStore();
  });

  test('seeded health records exist and belong to demo patient', () => {
    const state = useAppStore.getState();
    expect(state.healthRecords.length).toBeGreaterThanOrEqual(3);
    const patientRecords = state.healthRecords.filter((r) => r.patientId === 'patient-demo');
    expect(patientRecords.length).toBeGreaterThanOrEqual(3);
    expect(patientRecords[0].bloodPressure).toBe('120/80 mmHg');
    expect(patientRecords[0].bloodSugar).toBe('98 mg/dL');
    expect(patientRecords[0].status).toBe('completed');
  });

  test('can add a new health record for an assigned patient', () => {
    const newRecordId = useAppStore.getState().addHealthRecord({
      patientId: 'patient-demo',
      checkupDate: '2026-08-30',
      facilityId: 'jabalpur_phc',
      facilityName: 'Jabalpur Primary Health Centre',
      ashaId: 'asha-demo',
      healthWorkerName: 'Sunita ASHA',
      bloodPressure: '116/74 mmHg',
      bloodSugar: '90 mg/dL',
      weight: '64 kg',
      temperature: '98.5°F',
      symptoms: 'Routine follow-up',
      diagnosis: 'All vitals normal',
      medicines: ['Multivitamin daily'],
      notes: 'Patient advised to maintain hydration.',
      status: 'completed',
    });

    expect(newRecordId).toMatch(/^rec-\d+$/);
    const state = useAppStore.getState();
    const found = state.healthRecords.find((r) => r.id === newRecordId);
    expect(found).toBeDefined();
    expect(found?.bloodPressure).toBe('116/74 mmHg');
    expect(found?.patientId).toBe('patient-demo');
    expect(found?.ashaId).toBe('asha-demo');
  });

  test('ASHA worker only accesses assigned patients', () => {
    const state = useAppStore.getState();
    const ashaPatients = state.getAssignedPatients('asha-demo');
    expect(ashaPatients.length).toBe(1);
    expect(ashaPatients[0].id).toBe('patient-demo');

    // Unassigned ASHA receives empty array
    const unassignedPatients = state.getAssignedPatients('non-existent-asha');
    expect(unassignedPatients.length).toBe(0);
  });

  test('signing in switches session and role; signing out clears session', () => {
    // Sign in as patient
    const res = useAppStore.getState().signIn('patient@vaayu.demo', 'demo123');
    expect(res.user).toBeDefined();
    expect(useAppStore.getState().session?.userId).toBe('patient-demo');
    expect(useAppStore.getState().session?.role).toBe('patient');

    // Sign out
    useAppStore.getState().signOut();
    expect(useAppStore.getState().session).toBeNull();
  });
});

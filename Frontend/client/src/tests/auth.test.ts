import { describe, expect, test } from 'vitest';
import { verifyDemoOtp } from '../services/otpService';

describe('verification code format', () => {
  test('accepts a six-digit verification code', () => {
    expect(verifyDemoOtp('123456')).toBe(true);
  });

  test('rejects invalid verification codes', () => {
    expect(verifyDemoOtp('00000')).toBe(false);
  });
});

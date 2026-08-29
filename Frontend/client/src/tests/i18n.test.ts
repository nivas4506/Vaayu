import { describe, test, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, t } from '../i18n';

describe('i18n Localization', () => {
  test('english values', () => {
    expect(t('app_title', 'en')).toBe('VAAYU');
    expect(t('status_available', 'en')).toBe('Available');
  });
  test('hindi values', () => {
    expect(t('app_title', 'hi')).toBe('वायु');
    expect(t('status_available', 'hi')).toBe('उपलब्ध');
  });
  test('lists all requested Indian language choices', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(12);
    expect(SUPPORTED_LANGUAGES.map((language) => language.code)).toContain('ta');
  });
});

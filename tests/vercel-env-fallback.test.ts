import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

describe('Vercel environment fallback', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('uses pg-mem on Vercel when DATABASE_URL is not configured', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.VERCEL = '1';
    process.env.DATABASE_URL = '';
    delete process.env.USE_PG_MEM;

    const { ENV } = await import('../backend/src/config/env.ts');

    expect(ENV.USE_PG_MEM).toBe(true);
  });

  it('uses pg-mem on Vercel when DATABASE_URL points at localhost', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.VERCEL = '1';
    process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/vaayu';
    delete process.env.USE_PG_MEM;

    const { ENV } = await import('../backend/src/config/env.ts');

    expect(ENV.USE_PG_MEM).toBe(true);
  });
});

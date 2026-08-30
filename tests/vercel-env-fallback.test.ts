import { afterEach, describe, expect, it } from 'vitest';

const originalEnv = { ...process.env };

describe('Vercel environment fallback', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('uses pg-mem on Vercel when DATABASE_URL is not configured', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL = '1';
    delete process.env.DATABASE_URL;
    delete process.env.USE_PG_MEM;

    const { ENV } = await import(`../backend/src/config/env.ts?case=${Date.now()}`);

    expect(ENV.USE_PG_MEM).toBe(true);
  });
});

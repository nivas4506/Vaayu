import { app } from '../../backend/src/app.js';
import { seedDatabase } from '../../backend/src/db/seed.js';

let seedPromise: Promise<void> | null = null;

function ensureSeeded() {
  seedPromise ??= seedDatabase();
  return seedPromise;
}

export default async function handler(req: any, res: any) {
  await ensureSeeded();
  return app(req, res);
}

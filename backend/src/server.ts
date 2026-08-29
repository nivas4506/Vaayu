import { app } from './app.js';
import { ENV } from './config/env.js';
import { seedDatabase } from './db/seed.js';

async function startServer() {
  await seedDatabase();
  app.listen(ENV.PORT, () => {
    console.log(`🚀 Vaayu Healthcare API backend running on http://localhost:${ENV.PORT}/api/v1`);
  });
}

startServer();

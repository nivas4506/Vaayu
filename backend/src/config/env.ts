import dotenv from 'dotenv';

try {
  dotenv.config();
} catch (e) {
  // Safe fallback if .env is missing
}

export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/vaayu',
  USE_PG_MEM: process.env.USE_PG_MEM === 'true' || process.env.NODE_ENV === 'test',
  FRESHNESS_WINDOW_HOURS: 48,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  USE_REDIS: process.env.USE_REDIS === 'true',
};

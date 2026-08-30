import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert positional ? parameters to PostgreSQL $1, $2, $3 parameter markers
function convertPlaceholders(sql: string): string {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

function interpolateParams(sql: string, params: any[]): string {
  if (!params || params.length === 0) return sql;
  let result = sql;
  params.forEach((param, idx) => {
    let val: string;
    if (param === null || param === undefined) {
      val = 'NULL';
    } else if (typeof param === 'number' || typeof param === 'boolean') {
      val = String(param);
    } else {
      val = `'${String(param).replace(/'/g, "''")}'`;
    }
    const regex = new RegExp(`\\$${idx + 1}(?!\\d)`, 'g');
    result = result.replace(regex, val);
  });
  return result;
}

let memDb: any = null;
let pgPool: any = null;
let isInitialized = false;

function execPgMem(sql: string, method: 'none' | 'many' | 'oneOrNone', params?: any[]) {
  const fullSql = params && params.length > 0 ? interpolateParams(sql, params) : sql;
  try {
    const res = memDb.public.query(fullSql);
    if (method === 'many') return res.rows || [];
    if (method === 'oneOrNone') return res.rows && res.rows.length > 0 ? res.rows[0] : undefined;
    return;
  } catch (err: any) {
    if (err.message && (err.message.includes('Not supported') || err.message.includes('already exists'))) {
      if (method === 'many') return [];
      if (method === 'oneOrNone') return undefined;
      return;
    }
    throw err;
  }
}

let activeDatabaseUrl = '';

async function ensureDatabaseExists(databaseUrl: string) {
  try {
    const urlObj = new URL(databaseUrl);
    const targetDb = urlObj.pathname.replace(/^\//, '');
    if (!targetDb || targetDb === 'postgres') return databaseUrl;

    // Connect to maintenance database 'postgres' to verify/create target DB
    const maintenanceUrl = new URL(databaseUrl);
    maintenanceUrl.pathname = '/postgres';

    const client = new pg.Client({ connectionString: maintenanceUrl.toString() });
    await client.connect();

    // Check if target database exists (case-insensitive check)
    const res = await client.query(
      `SELECT datname FROM pg_database WHERE LOWER(datname) = LOWER($1)`,
      [targetDb]
    );

    let actualDbName = targetDb;
    if (res.rows.length === 0) {
      console.log(`ℹ️ Database "${targetDb}" not found in PostgreSQL. Auto-creating database "${targetDb}"...`);
      await client.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`Database "${targetDb}" created successfully!`);
    } else {
      actualDbName = res.rows[0].datname;
    }

    await client.end();

    const finalUrl = new URL(databaseUrl);
    finalUrl.pathname = `/${actualDbName}`;
    activeDatabaseUrl = finalUrl.toString();
    return activeDatabaseUrl;
  } catch (err: any) {
    console.warn(`[DB Setup] Automatic database verification:`, err.message || err);
    return databaseUrl;
  }
}

function getPgPool() {
  if (!pgPool && !ENV.USE_PG_MEM) {
    pgPool = new pg.Pool({
      connectionString: activeDatabaseUrl || ENV.DATABASE_URL,
    });
  }
  return pgPool;
}

let initPromise: Promise<void> | null = null;

export async function initDatabase() {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    if (ENV.USE_PG_MEM) {
      if (!memDb) {
        try {
          const { newDb } = await import('pg-mem');
          memDb = newDb();
        } catch (err) {
          console.error('Failed to load pg-mem:', err);
        }
      }
      if (memDb) {
        memDb.public.query(schemaSql);
      }
    } else {
      await ensureDatabaseExists(ENV.DATABASE_URL);
      const pool = getPgPool();
      const statements = schemaSql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (err: any) {
          if (err.code === '23505' || err.code === '42P07' || err.message?.includes('already exists')) {
            continue;
          }
          throw err;
        }
      }
    }
    isInitialized = true;
  })();

  return initPromise;
}

export { pgPool, memDb };

// Universal Database Client for PostgreSQL & In-Memory Postgres
export const db = {
  async exec(sql: string) {
    await initDatabase();
    if (ENV.USE_PG_MEM && memDb) {
      memDb.public.query(sql);
    } else {
      const pool = getPgPool();
      await pool.query(sql);
    }
  },

  prepare(sql: string) {
    const pgSql = convertPlaceholders(sql);
    return {
      all(...params: any[]): any[] {
        const bindParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        if (ENV.USE_PG_MEM && memDb) {
          const res = execPgMem(pgSql, 'many', bindParams);
          return res || [];
        } else {
          const pool = getPgPool();
          let res: any[] = [];
          if (pool) {
            pool.query(pgSql, bindParams).then((r: any) => { res = r.rows; }).catch((e: any) => console.error(e));
          }
          return res;
        }
      },

      get(...params: any[]): any | undefined {
        const bindParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        if (ENV.USE_PG_MEM && memDb) {
          return execPgMem(pgSql, 'oneOrNone', bindParams);
        } else {
          const pool = getPgPool();
          let res: any = undefined;
          if (pool) {
            pool.query(pgSql, bindParams).then((r: any) => { res = r.rows[0]; }).catch((e: any) => console.error(e));
          }
          return res;
        }
      },

      async run(...params: any[]) {
        await initDatabase();
        const bindParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        if (ENV.USE_PG_MEM && memDb) {
          execPgMem(pgSql, 'none', bindParams);
        } else {
          const pool = getPgPool();
          await pool.query(pgSql, bindParams);
        }
        return { changes: 1 };
      }
    };
  },

  transaction(fn: () => void) {
    return () => {
      if (ENV.USE_PG_MEM && memDb) {
        memDb.public.query('BEGIN;');
        try {
          fn();
          memDb.public.query('COMMIT;');
        } catch (err) {
          memDb.public.query('ROLLBACK;');
          throw err;
        }
      } else {
        const pool = getPgPool();
        pool.query('BEGIN;');
        try {
          fn();
          pool.query('COMMIT;');
        } catch (err) {
          pool.query('ROLLBACK;');
          throw err;
        }
      }
    };
  }
};

import pg from 'pg';
import { newDb } from 'pg-mem';
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

if (ENV.USE_PG_MEM) {
  memDb = newDb();
} else {
  pgPool = new pg.Pool({
    connectionString: ENV.DATABASE_URL,
  });
}

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

export { pgPool, memDb };

export async function initDatabase() {
  if (isInitialized) return;
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  if (ENV.USE_PG_MEM && memDb) {
    memDb.public.query(schemaSql);
  } else if (pgPool) {
    await pgPool.query(schemaSql);
  }
  isInitialized = true;
}

// Universal Database Client for PostgreSQL & In-Memory Postgres
export const db = {
  async exec(sql: string) {
    if (ENV.USE_PG_MEM && memDb) {
      memDb.public.query(sql);
    } else if (pgPool) {
      await pgPool.query(sql);
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
        } else if (pgPool) {
          let res: any[] = [];
          pgPool.query(pgSql, bindParams).then((r: any) => { res = r.rows; }).catch((e: any) => console.error(e));
          return res;
        }
        return [];
      },

      get(...params: any[]): any | undefined {
        const bindParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        if (ENV.USE_PG_MEM && memDb) {
          return execPgMem(pgSql, 'oneOrNone', bindParams);
        } else if (pgPool) {
          let res: any = undefined;
          pgPool.query(pgSql, bindParams).then((r: any) => { res = r.rows[0]; }).catch((e: any) => console.error(e));
          return res;
        }
        return undefined;
      },

      async run(...params: any[]) {
        const bindParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        if (ENV.USE_PG_MEM && memDb) {
          execPgMem(pgSql, 'none', bindParams);
        } else if (pgPool) {
          await pgPool.query(pgSql, bindParams);
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
      } else if (pgPool) {
        pgPool.query('BEGIN;');
        try {
          fn();
          pgPool.query('COMMIT;');
        } catch (err) {
          pgPool.query('ROLLBACK;');
          throw err;
        }
      }
    };
  }
};

// Initialize database schema on load
initDatabase();

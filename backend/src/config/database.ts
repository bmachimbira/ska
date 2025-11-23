/**
 * Database Configuration
 * Provides a shared PostgreSQL connection pool
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Create a singleton pool instance
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
    });

    pool.on('connect', () => {
      console.log('✓ Database pool connection established');
    });
  }

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✓ Database pool closed');
  }
}

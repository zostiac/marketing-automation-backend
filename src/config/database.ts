import { Pool } from 'pg';
import { config } from './env';

const pool = new Pool({
  connectionString: config.database_url,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = pool;

export async function initializeDatabase() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected at', result.rows[0].now);
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}
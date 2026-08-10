import { Pool } from 'pg';
import { config } from './env';

const isProduction = config.node_env === 'production' || !!process.env.RAILWAY_ENVIRONMENT;
const isCloudDatabase =
  config.database_url.includes('railway') ||
  config.database_url.includes('sslmode=require') ||
  config.database_url.includes('supabase') ||
  config.database_url.includes('aws') ||
  (isProduction && !config.database_url.includes('localhost') && !config.database_url.includes('127.0.0.1'));

const pool = new Pool({
  connectionString: config.database_url || 'postgresql://localhost:5432/school_marketing',
  ssl: isCloudDatabase ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client:', err);
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

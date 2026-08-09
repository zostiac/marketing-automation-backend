import { Pool, QueryResult } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Allow the pool to close idle clients after 30s
  idleTimeoutMillis: 30_000,
  // Fail fast if a connection can't be established
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err.message);
});

/**
 * Execute a single SQL query against the PostgreSQL database.
 * Uses a connection pool internally — no need to call `.end()` after each query.
 */
export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

/**
 * Get a dedicated client from the pool (for transactions).
 * Always call `client.release()` when done.
 */
export const getClient = () => pool.connect();

export default pool;
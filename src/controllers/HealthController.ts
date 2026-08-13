import { Request, Response } from 'express';
import { db } from '../config/database';
import { redis } from '../config/redis';

async function checkDatabase(): Promise<{ ok: boolean; error?: string }> {
  try {
    await db.query('SELECT 1');
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function checkRedis(): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!redis.isOpen) return { ok: false, error: 'Redis client is not connected' };
    const pong = await redis.ping();
    return { ok: pong === 'PONG' };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export class HealthController {
  /** Process liveness probe used by Railway. */
  static getHealth(_req: Request, res: Response) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }

  /** Dependency readiness probe. */
  static async getReady(_req: Request, res: Response) {
    const [database, cache] = await Promise.all([checkDatabase(), checkRedis()]);
    const ready = database.ok && cache.ok;

    res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: { database, redis: cache },
    });
  }
}

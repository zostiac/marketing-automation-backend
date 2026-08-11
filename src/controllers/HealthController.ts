import { Request, Response } from "express";
import { db } from "../config/database";
import { config } from "../config/env";

export class HealthController {
  static async health(_req: Request, res: Response) {
    const checks: Record<string, string> = {};
    let healthy = true;

    // Check database if configured
    if (config.database_url) {
      try {
        await db.query("SELECT 1");
        checks.database = "ok";
      } catch (err) {
        checks.database = `error: ${String(err).slice(0, 200)}`;
        healthy = false;
      }
    } else {
      checks.database = "not_configured";
    }

    // Redis check is best-effort; we don't fail health if redis is down but report it
    // Import lazily to avoid circular deps during bootstrap
    try {
      const { redis } = await import("../config/redis");
      if (redis.isOpen) {
        await redis.ping();
        checks.redis = "ok";
      } else {
        checks.redis = "disconnected";
      }
    } catch {
      checks.redis = config.redis_url ? "error" : "not_configured";
    }

    const payload = {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0",
      config: {
        hasDatabase: !!config.database_url,
        hasRedis: !!config.redis_url,
        hasOpenAI: !!config.openai_api_key,
        env: config.node_env,
      },
      checks,
    };

    res.status(healthy ? 200 : 200).json(payload);
  }

  static async healthz(req: Request, res: Response) {
    return HealthController.health(req, res);
  }
}

import { Request, Response } from "express";
import { db } from "../config/database";

export class AdminController {
  static async getSystemStats(_req: Request, res: Response) {
    try {
      const result = await db.query(`
        SELECT
          (SELECT COUNT(*) FROM schools) as schools,
          (SELECT COUNT(*) FROM events) as events,
          (SELECT COUNT(*) FROM design_jobs) as jobs,
          (SELECT COUNT(*) FROM assets) as assets
      `);
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  static async getRecentJobs(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit) || 20;
      const result = await db.query(
        `SELECT * FROM design_jobs ORDER BY created_at DESC LIMIT $1`,
        [limit],
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  static async getFailedJobs(_req: Request, res: Response) {
    try {
      const result = await db.query(
        `SELECT * FROM design_jobs WHERE status = 'FAILED' ORDER BY created_at DESC LIMIT 50`,
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  static async getMetrics(_req: Request, res: Response) {
    try {
      const result = await db.query(`
        SELECT status, COUNT(*) as count FROM design_jobs GROUP BY status
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

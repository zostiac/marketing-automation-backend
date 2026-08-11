import { Request, Response } from "express";
import { AnalyticsService } from "../services/AnalyticsService";

export class AnalyticsController {
  static async getDesignAnalytics(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };
      if (!startDate || !endDate) {
        res.status(400).json({ error: "startDate and endDate required" });
        return;
      }
      const rows = await AnalyticsService.getDesignAnalytics(
        schoolId,
        new Date(startDate),
        new Date(endDate),
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  static async getSuccessRateByEventType(req: Request, res: Response) {
    try {
      const rows = await AnalyticsService.getSuccessRateByEventType(
        req.params.schoolId,
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  static async getTopPerformingEvents(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 5;
      const rows = await AnalyticsService.getTopPerformingEvents(
        req.params.schoolId,
        limit,
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

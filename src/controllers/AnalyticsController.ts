import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { AppError } from '../utils/errors';

export class AnalyticsController {
  static async getDesignAnalytics(req: Request, res: Response) {
    const { schoolId } = req.params;
    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };
    if (!startDate || !endDate) {
      throw AppError.badRequest('startDate and endDate required');
    }
    const rows = await AnalyticsService.getDesignAnalytics(
      schoolId,
      new Date(startDate),
      new Date(endDate),
    );
    res.json(rows);
  }

  static async getSuccessRateByEventType(req: Request, res: Response) {
    const rows = await AnalyticsService.getSuccessRateByEventType(
      req.params.schoolId,
    );
    res.json(rows);
  }

  static async getTopPerformingEvents(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const rows = await AnalyticsService.getTopPerformingEvents(
      req.params.schoolId,
      limit,
    );
    res.json(rows);
  }
}

import { Request, Response } from 'express';
import { ContentCalendarService } from '../services/ContentCalendarService';
import { ScheduledPublisher } from '../services/ScheduledPublisher';
import { AppError } from '../utils/errors';

export class ContentCalendarController {
  static getToday(_req: Request, res: Response) {
    res.json(ContentCalendarService.getTodayInNepal());
  }

  static getFestivals(req: Request, res: Response) {
    const year = Number(req.query.year);
    const month = req.query.month !== undefined ? Number(req.query.month) : undefined;
    if (!Number.isInteger(year)) {
      throw AppError.badRequest('year query parameter must be an integer BS year');
    }
    if (month !== undefined && !Number.isInteger(month)) {
      throw AppError.badRequest('month query parameter must be an integer');
    }
    res.json(ContentCalendarService.getNepalFestivals(year, month));
  }

  static async getNepaliCalendar(req: Request, res: Response) {
    const { schoolId } = req.params;
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      throw AppError.badRequest('year and month query parameters are required');
    }
    const calendar = await ContentCalendarService.getNepaliCalendar(
      schoolId,
      year,
      month,
    );
    res.json(calendar);
  }

  static async getCalendar(req: Request, res: Response) {
    const { schoolId } = req.params;
    const offset = req.query.monthOffset ? Number(req.query.monthOffset) : 0;
    const rows = await ContentCalendarService.getCalendar(schoolId, offset);
    res.json(rows);
  }

  static async createEntry(req: Request, res: Response) {
    const { schoolId, ...entry } = req.body;
    const row = await ContentCalendarService.createCalendarEntry(schoolId, {
      ...entry,
      status: entry.status || 'draft',
    });
    res.status(201).json(row);
  }

  static async schedulePublishing(req: Request, res: Response) {
    const { schoolId, eventId, platforms } = req.body;
    await ContentCalendarService.schedulePublishing(schoolId, eventId, platforms);
    res.json({ ok: true });
  }

  static async syncFestivals(req: Request, res: Response) {
    const { schoolId, bsYear, createCalendarEntries, platforms, status } = req.body;
    const events = await ContentCalendarService.syncNepalFestivals(
      schoolId,
      bsYear,
      { createCalendarEntries, platforms, status },
    );
    res.status(201).json({ count: events.length, events });
  }

  static async publishDue(_req: Request, res: Response) {
    const result = await ScheduledPublisher.processDueEntries();
    res.json(result);
  }

  static async publishEntry(req: Request, res: Response) {
    const result = await ScheduledPublisher.publishEntry(req.params.id);
    res.json(result);
  }
}

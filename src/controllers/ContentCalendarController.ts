import { Request, Response } from "express";
import { ContentCalendarService } from "../services/ContentCalendarService";

export class ContentCalendarController {
  static async getCalendar(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      const offset = req.query.monthOffset ? Number(req.query.monthOffset) : 0;
      const rows = await ContentCalendarService.getCalendar(schoolId, offset);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  static async createEntry(req: Request, res: Response) {
    try {
      const { schoolId, ...entry } = req.body;
      if (!schoolId) {
        res.status(400).json({ error: "schoolId required" });
        return;
      }
      const row = await ContentCalendarService.createCalendarEntry(
        schoolId,
        entry,
      );
      res.status(201).json(row);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }

  static async schedulePublishing(req: Request, res: Response) {
    try {
      const { schoolId, eventId, platforms } = req.body;
      await ContentCalendarService.schedulePublishing(
        schoolId,
        eventId,
        platforms,
      );
      res.json({ ok: true });
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }
}

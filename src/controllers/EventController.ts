import { Request, Response } from 'express';
import { EventService } from '../services/EventService';
import { AppError } from '../utils/errors';
import { isUuid } from '../utils/helpers';

export class EventController {
  static async listEvents(req: Request, res: Response) {
    const schoolId = String(req.query.schoolId || '');
    if (!isUuid(schoolId)) {
      throw AppError.badRequest('schoolId query parameter is required');
    }
    const events = await EventService.listEvents(schoolId);
    res.json(events);
  }

  static async createEvent(req: Request, res: Response) {
    const event = await EventService.createEvent(req.body.school_id, req.body);
    res.status(201).json(event);
  }

  static async getTodayEvents(req: Request, res: Response) {
    const events = await EventService.getTodayEvents(req.params.schoolId);
    res.json(events);
  }

  static async getEvent(req: Request, res: Response) {
    const event = await EventService.getEvent(req.params.id);
    res.json(event);
  }

  static async updateEvent(req: Request, res: Response) {
    const event = await EventService.updateEvent(req.params.id, req.body);
    res.json(event);
  }

  static async deleteEvent(req: Request, res: Response) {
    await EventService.deleteEvent(req.params.id);
    res.status(204).send();
  }
}

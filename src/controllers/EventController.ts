import { Request, Response } from 'express';
import { EventService } from '../services/EventService';

export class EventController {
  static async createEvent(req: Request, res: Response) {
    try {
      const event = await EventService.createEvent(req.body.school_id, req.body);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }

  static async getTodayEvents(req: Request, res: Response) {
    try {
      const events = await EventService.getTodayEvents(req.params.schoolId);
      res.json(events);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }

  static async getEvent(req: Request, res: Response) {
    try {
      const event = await EventService.getEvent(req.params.id);
      res.json(event);
    } catch (error) {
      res.status(404).json({ error: 'Event not found' });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      const event = await EventService.updateEvent(req.params.id, req.body);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    try {
      await EventService.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: 'Event not found' });
    }
  }
}
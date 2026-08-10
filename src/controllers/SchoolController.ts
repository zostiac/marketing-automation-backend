import { Request, Response } from 'express';
import { SchoolService } from '../services/SchoolService';

export class SchoolController {
  static async getSchoolProfile(req: Request, res: Response) {
    try {
      const school = await SchoolService.getSchoolProfile(req.params.id);
      res.json(school);
    } catch (error) {
      res.status(404).json({ error: 'School not found' });
    }
  }

  static async updateSchoolProfile(req: Request, res: Response) {
    try {
      const school = await SchoolService.updateSchoolProfile(req.params.id, req.body);
      res.json(school);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }

  static async getBranding(req: Request, res: Response) {
    try {
      const branding = await SchoolService.getBrandingInfo(req.params.id);
      res.json(branding);
    } catch (error) {
      res.status(404).json({ error: 'School not found' });
    }
  }
}
import { Request, Response } from 'express';
import { SchoolService } from '../services/SchoolService';

export class SchoolController {
  static async listSchools(req: Request, res: Response) {
    try {
      const schools = await SchoolService.listSchools();
      res.json(schools);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  static async createSchool(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'name is required' });

      // simple idempotency: if allowUpsert query or body flag, upsert; otherwise plain create will 409 on duplicate name
      const allowUpsert = req.query.upsert === 'true' || req.body.upsert === true;
      if (allowUpsert) {
        const { school, created } = await SchoolService.upsertSchool(req.body);
        return res.status(created ? 201 : 200).json(school);
      }

      const school = await SchoolService.createSchool(req.body);
      res.status(201).json(school);
    } catch (error: any) {
      // unique violation or other
      if (String(error?.message).includes('duplicate') || String(error?.code) === '23505') {
        return res.status(409).json({ error: 'School with this name already exists', details: String(error.message || error) });
      }
      res.status(400).json({ error: String(error?.message || error) });
    }
  }

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

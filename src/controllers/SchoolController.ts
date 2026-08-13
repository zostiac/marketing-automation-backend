import { Request, Response } from 'express';
import { SchoolService } from '../services/SchoolService';
import { AppError } from '../utils/errors';

export class SchoolController {
  static async listSchools(_req: Request, res: Response) {
    const schools = await SchoolService.listSchools();
    res.json(schools);
  }

  static async createSchool(req: Request, res: Response) {
    const { name } = req.body;
    if (!name) throw AppError.badRequest('name is required');

    const allowUpsert = req.query.upsert === 'true' || req.body.upsert === true;
    try {
      if (allowUpsert) {
        const { school, created } = await SchoolService.upsertSchool(req.body);
        res.status(created ? 201 : 200).json(school);
        return;
      }

      const school = await SchoolService.createSchool(req.body);
      res.status(201).json(school);
    } catch (error: any) {
      if (
        String(error?.message).includes('duplicate') ||
        String(error?.code) === '23505'
      ) {
        throw AppError.conflict('School with this name already exists', {
          details: String(error.message || error),
        });
      }
      throw error;
    }
  }

  static async getSchoolProfile(req: Request, res: Response) {
    const school = await SchoolService.getSchoolProfile(req.params.id);
    res.json(school);
  }

  static async updateSchoolProfile(req: Request, res: Response) {
    const school = await SchoolService.updateSchoolProfile(req.params.id, req.body);
    res.json(school);
  }

  static async getBranding(req: Request, res: Response) {
    const branding = await SchoolService.getBrandingInfo(req.params.id);
    res.json(branding);
  }
}

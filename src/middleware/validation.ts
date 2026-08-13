import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError } from '../utils/errors';

const uuid = z.string().uuid();

export const schoolCreateSchema = z.object({
  name: z.string().trim().min(1),
  tagline: z.string().optional(),
  location: z.string().optional(),
  official_logo_url: z.string().optional(),
  brand_colors: z.record(z.unknown()).optional(),
  typography: z.record(z.unknown()).optional(),
  visual_style: z.string().optional(),
  logo_protection_rules: z.record(z.unknown()).optional(),
  design_preferences: z.record(z.unknown()).optional(),
  social_media_info: z.record(z.unknown()).optional(),
  upsert: z.boolean().optional(),
});

export const eventCreateSchema = z.object({
  school_id: uuid,
  name: z.string().trim().min(1),
  event_date: z.string().min(1),
  event_type: z.string().trim().min(1),
  description: z.string().optional(),
  relevance: z.string().optional(),
  design_requirement: z.string().optional(),
  preferred_design_type: z.string().optional(),
  custom_instructions: z.string().optional(),
});

export const designRequestSchema = z.object({
  school_id: uuid,
  event_id: uuid,
  design_type: z.string().trim().min(1).optional(),
});

export const calendarEntrySchema = z.object({
  schoolId: uuid,
  event_id: uuid,
  scheduled_publish_date: z.union([z.string(), z.date()]),
  platforms: z.array(z.string().trim().min(1)).min(1),
  status: z.enum(['draft', 'scheduled', 'published']).optional(),
  caption: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
});

export const schedulePublishSchema = z.object({
  schoolId: uuid,
  eventId: uuid,
  platforms: z.array(z.string().trim().min(1)).min(1),
});

export const syncFestivalsSchema = z.object({
  schoolId: uuid,
  bsYear: z.number().int(),
  createCalendarEntries: z.boolean().optional(),
  platforms: z.array(z.string().trim().min(1)).optional(),
  status: z.enum(['draft', 'scheduled']).optional(),
});

export const socialPublishSchema = z.object({
  platform: z.enum(['facebook', 'instagram', 'tiktok']).optional(),
  caption: z.string().optional(),
  imageStorageKey: z.string().min(1),
  hashtags: z.array(z.string()).optional(),
});

export const socialPublishBatchSchema = z.union([
  z.object({ posts: z.array(socialPublishSchema).min(1) }),
  socialPublishSchema,
]);

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(
        AppError.badRequest('Invalid request body', parsed.error.flatten()),
      );
      return;
    }
    req.body = parsed.data;
    next();
  };
}

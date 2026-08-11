import { db } from '../config/database';
import { School } from '../models/types';

export class SchoolService {
  static async getSchoolProfile(schoolId: string): Promise<School> {
    const result = await db.query('SELECT * FROM schools WHERE id = $1', [schoolId]);
    if (!result.rows.length) throw new Error('School not found');
    return result.rows[0];
  }

  static async listSchools(): Promise<School[]> {
    const result = await db.query('SELECT * FROM schools ORDER BY created_at ASC');
    return result.rows;
  }

  static async findByName(name: string): Promise<School | null> {
    const result = await db.query('SELECT * FROM schools WHERE name = $1 LIMIT 1', [name]);
    return result.rows[0] || null;
  }

  static async createSchool(data: Partial<School> & { name: string }): Promise<School> {
    if (!data.name) throw new Error('name is required');

    // normalize / ensure defaults for JSONB fields
    const payload = {
      name: data.name,
      tagline: data.tagline ?? null,
      location: data.location ?? null,
      official_logo_url: data.official_logo_url ?? null,
      brand_colors: data.brand_colors ? JSON.stringify(data.brand_colors) : null,
      typography: data.typography ? JSON.stringify(data.typography) : null,
      visual_style: data.visual_style ?? null,
      logo_protection_rules: data.logo_protection_rules ? JSON.stringify(data.logo_protection_rules) : null,
      design_preferences: data.design_preferences ? JSON.stringify(data.design_preferences) : null,
      social_media_info: data.social_media_info ? JSON.stringify(data.social_media_info) : null,
    };

    // Use JSONB casting — pg will handle stringified JSON as jsonb
    const result = await db.query(
      `INSERT INTO schools (
        name, tagline, location, official_logo_url,
        brand_colors, typography, visual_style,
        logo_protection_rules, design_preferences, social_media_info
      ) VALUES (
        $1, $2, $3, $4,
        $5::jsonb, $6::jsonb, $7,
        $8::jsonb, $9::jsonb, $10::jsonb
      ) RETURNING *`,
      [
        payload.name,
        payload.tagline,
        payload.location,
        payload.official_logo_url,
        payload.brand_colors,
        payload.typography,
        payload.visual_style,
        payload.logo_protection_rules,
        payload.design_preferences,
        payload.social_media_info,
      ]
    );

    return result.rows[0];
  }

  /**
   * Upsert by name — idempotent for seeding. If a school with the same name exists,
   * it updates it and returns the row; otherwise inserts.
   */
  static async upsertSchool(data: Partial<School> & { name: string }): Promise<{ school: School; created: boolean }> {
    const existing = await this.findByName(data.name);
    if (existing) {
      const updated = await this.updateSchoolProfile(existing.id, data);
      return { school: updated, created: false };
    }
    const created = await this.createSchool(data);
    return { school: created, created: true };
  }

  static async updateSchoolProfile(schoolId: string, updates: Partial<School>): Promise<School> {
    // stringify JSONB fields if present
    const jsonbFields = new Set(['brand_colors', 'typography', 'logo_protection_rules', 'design_preferences', 'social_media_info']);
    const sanitized: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined) continue;
      if (jsonbFields.has(k) && v !== null && typeof v === 'object') {
        sanitized[k] = JSON.stringify(v);
      } else {
        sanitized[k] = v;
      }
    }

    const fields = Object.keys(sanitized);
    if (fields.length === 0) return this.getSchoolProfile(schoolId);

    const values = fields.map(f => sanitized[f]);
    const setClause = fields.map((f, i) => {
      if (jsonbFields.has(f)) return `${f} = $${i + 1}::jsonb`;
      return `${f} = $${i + 1}`;
    }).join(', ');
    
    const result = await db.query(
      `UPDATE schools SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, schoolId]
    );
    
    if (!result.rows.length) throw new Error('School not found');
    return result.rows[0];
  }

  static async getBrandingInfo(schoolId: string) {
    const school = await this.getSchoolProfile(schoolId);
    return {
      name: school.name,
      tagline: school.tagline,
      logo_url: school.official_logo_url,
      brand_colors: school.brand_colors,
      typography: school.typography,
      visual_style: school.visual_style,
    };
  }
}

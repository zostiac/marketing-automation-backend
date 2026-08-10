import { db } from '../config/database';
import { School } from '../models/types';

export class SchoolService {
  static async getSchoolProfile(schoolId: string): Promise<School> {
    const result = await db.query('SELECT * FROM schools WHERE id = $1', [schoolId]);
    if (!result.rows.length) throw new Error('School not found');
    return result.rows[0];
  }

  static async updateSchoolProfile(schoolId: string, updates: Partial<School>): Promise<School> {
    const fields = Object.keys(updates).filter(k => updates[k as keyof Partial<School>] !== undefined);
    const values = fields.map(f => updates[f as keyof Partial<School>]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    
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
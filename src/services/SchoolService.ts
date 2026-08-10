import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import { School } from '../models/types';

export class SchoolService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.databaseUrl,
    });
  }

  async getSchoolProfile(schoolId: string): Promise<School> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM schools WHERE id = $1',
        [schoolId]
      );

      if (result.rows.length === 0) {
        throw new Error(`School not found: ${schoolId}`);
      }

      return this.mapRowToSchool(result.rows[0]);
    } catch (error) {
      logger.error('Error fetching school profile:', error);
      throw error;
    }
  }

  async validateBrandingConsistency(schoolId: string): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const result = await this.pool.query(
        'SELECT * FROM schools WHERE id = $1',
        [schoolId]
      );

      if (result.rows.length === 0) {
        throw new Error(`School not found: ${schoolId}`);
      }

      const school = result.rows[0];

      if (!school.name) issues.push('School name not set');
      if (!school.official_logo_url) issues.push('Official logo not uploaded');
      if (!school.brand_colors) issues.push('Brand colors not defined');
      if (!school.typography) issues.push('Typography preferences not set');

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      logger.error('Error validating branding:', error);
      throw error;
    }
  }

  private mapRowToSchool(row: any): School {
    return {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      name: row.name,
      slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
      domain: row.domain || '',
      brandColor: row.brand_colors?.primary || '#000000',
      logoUrl: row.official_logo_url,
      settings: {
        autoPublish: row.design_preferences?.autoPublish || false,
        defaultTemplate: row.design_preferences?.defaultTemplate || 'default',
        socialAccounts: row.social_media_info || [],
      },
    };
  }
}

export const schoolService = new SchoolService();
import { db } from "../config/database";

export class MultiSchoolManager {
  static async createSchoolAccount(schoolData: {
    name: string;
    tagline: string;
    location: string;
    admin_email: string;
  }): Promise<string> {
    try {
      const result = await db.query(
        `INSERT INTO schools (name, tagline, location)
         VALUES ($1, $2, $3) RETURNING id`,
        [schoolData.name, schoolData.tagline, schoolData.location],
      );

      const schoolId = result.rows[0].id;

      // Store admin info
      await db.query(
        `INSERT INTO school_admins (school_id, email) VALUES ($1, $2)`,
        [schoolId, schoolData.admin_email],
      );

      return schoolId;
    } catch (error) {
      console.error("Error creating school account:", error);
      throw error;
    }
  }

  static async getSchoolStats(schoolId: string): Promise<any> {
    try {
      const result = await db.query(
        `SELECT
           s.name,
           COUNT(DISTINCT e.id) as total_events,
           COUNT(DISTINCT dr.id) as total_designs,
           COUNT(DISTINCT dj.id) as total_jobs,
           COUNT(CASE WHEN dj.status = 'APPROVED' THEN 1 END) as approved_designs,
           COUNT(CASE WHEN dj.status = 'FAILED' THEN 1 END) as failed_designs
         FROM schools s
         LEFT JOIN events e ON s.id = e.school_id
         LEFT JOIN design_requests dr ON s.id = dr.school_id
         LEFT JOIN design_jobs dj ON dr.id = dj.design_request_id
         WHERE s.id = $1
         GROUP BY s.id, s.name`,
        [schoolId],
      );

      return result.rows[0] || {};
    } catch (error) {
      console.error("Error fetching school stats:", error);
      throw error;
    }
  }
}

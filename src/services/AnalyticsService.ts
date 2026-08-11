import { db } from "../config/database";

export class AnalyticsService {
  static async getDesignAnalytics(
    schoolId: string,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      const result = await db.query(
        `SELECT
           e.name as event_name,
           COUNT(*) as total_designs,
           COUNT(CASE WHEN dj.status = 'APPROVED' THEN 1 END) as approved_count,
           COUNT(CASE WHEN dj.status = 'FAILED' THEN 1 END) as failed_count,
           AVG(EXTRACT(EPOCH FROM (dj.completed_at - dj.started_at))) as avg_generation_time,
           MAX(dj.generation_time_ms) as max_generation_time,
           MIN(dj.generation_time_ms) as min_generation_time
         FROM design_jobs dj
         JOIN design_requests dr ON dj.design_request_id = dr.id
         JOIN events e ON dr.event_id = e.id
         WHERE dr.school_id = $1
           AND dj.created_at >= $2
           AND dj.created_at <= $3
         GROUP BY e.id, e.name
         ORDER BY total_designs DESC`,
        [schoolId, startDate, endDate],
      );

      return result.rows;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  }

  static async getSuccessRateByEventType(schoolId: string) {
    try {
      const result = await db.query(
        `SELECT
           e.event_type,
           COUNT(*) as total,
           COUNT(CASE WHEN dj.status = 'APPROVED' THEN 1 END) as successful,
           ROUND((COUNT(CASE WHEN dj.status = 'APPROVED' THEN 1 END)::numeric / COUNT(*)) * 100, 2) as success_rate
         FROM design_jobs dj
         JOIN design_requests dr ON dj.design_request_id = dr.id
         JOIN events e ON dr.event_id = e.id
         WHERE dr.school_id = $1
         GROUP BY e.event_type
         ORDER BY success_rate DESC`,
        [schoolId],
      );

      return result.rows;
    } catch (error) {
      console.error("Error fetching success rates:", error);
      throw error;
    }
  }

  static async getTopPerformingEvents(schoolId: string, limit: number = 5) {
    try {
      const result = await db.query(
        `SELECT
           e.id,
           e.name,
           COUNT(*) as design_count,
           AVG(a.file_size_bytes) as avg_file_size,
           COUNT(CASE WHEN a.quality_status = 'APPROVED' THEN 1 END) as quality_approved_count
         FROM events e
         LEFT JOIN design_requests dr ON e.id = dr.event_id
         LEFT JOIN design_jobs dj ON dr.id = dj.design_request_id
         LEFT JOIN assets a ON dj.id = a.design_job_id
         WHERE e.school_id = $1
         GROUP BY e.id, e.name
         ORDER BY design_count DESC
         LIMIT $2`,
        [schoolId, limit],
      );

      return result.rows;
    } catch (error) {
      console.error("Error fetching top events:", error);
      throw error;
    }
  }
}

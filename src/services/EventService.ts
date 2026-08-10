import { db } from '../config/database';
import { Event } from '../models/types';

export class EventService {
  static async createEvent(schoolId: string, eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const result = await db.query(
      `INSERT INTO events (school_id, name, event_date, event_type, description, relevance, design_requirement, preferred_design_type, custom_instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [schoolId, eventData.name, eventData.event_date, eventData.event_type, eventData.description, eventData.relevance, eventData.design_requirement, eventData.preferred_design_type, eventData.custom_instructions]
    );
    return result.rows[0];
  }

  static async getTodayEvents(schoolId: string): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0];
    const result = await db.query(
      'SELECT * FROM events WHERE school_id = $1 AND event_date = $2',
      [schoolId, today]
    );
    return result.rows;
  }

  static async getEvent(eventId: string): Promise<Event> {
    const result = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (!result.rows.length) throw new Error('Event not found');
    return result.rows[0];
  }

  static async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    const fields = Object.keys(updates).filter(k => updates[k as keyof Partial<Event>] !== undefined);
    const values = fields.map(f => updates[f as keyof Partial<Event>]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    
    const result = await db.query(
      `UPDATE events SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, eventId]
    );
    
    return result.rows[0];
  }

  static async deleteEvent(eventId: string): Promise<void> {
    await db.query('DELETE FROM events WHERE id = $1', [eventId]);
  }
}
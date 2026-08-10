import cron from 'node-cron';
import { db } from '../config/database';
import { designQueue } from './designQueue';
import { config } from '../config/env';

export function startScheduledTasks() {
  const [hour, minute] = config.scheduled_check_time.split(':');
  const cronExpression = `${minute} ${hour} * * *`;

  cron.schedule(cronExpression, async () => {
    console.log('Running scheduled event check...');
    
    try {
      const schoolsResult = await db.query('SELECT id FROM schools');
      
      for (const school of schoolsResult.rows) {
        const today = new Date().toISOString().split('T')[0];
        
        const eventsResult = await db.query(
          'SELECT * FROM events WHERE school_id = $1 AND event_date = $2',
          [school.id, today]
        );

        for (const event of eventsResult.rows) {
          const existingResult = await db.query(
            `SELECT * FROM design_requests WHERE event_id = $1 AND DATE(requested_at) = CURRENT_DATE`,
            [event.id]
          );

          if (existingResult.rows.length === 0) {
            const designRequestResult = await db.query(
              `INSERT INTO design_requests (school_id, event_id, design_type, status)
               VALUES ($1, $2, $3, $4) RETURNING id`,
              [school.id, event.id, 'poster', 'PENDING']
            );

            const designJobResult = await db.query(
              `INSERT INTO design_jobs (design_request_id, status) VALUES ($1, $2) RETURNING id`,
              [designRequestResult.rows[0].id, 'QUEUED']
            );

            const jobId = designJobResult.rows[0].id;

            await designQueue.add(
              { jobId, designRequestId: designRequestResult.rows[0].id },
              { attempts: config.max_retries, backoff: { type: 'exponential', delay: 2000 } }
            );

            console.log(`Queued design job for event: ${event.name}`);
          }
        }
      }
    } catch (error) {
      console.error('Scheduled task error:', error);
    }
  });

  console.log(`Scheduled task configured for ${config.scheduled_check_time}`);
}
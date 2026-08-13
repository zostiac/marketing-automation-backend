import cron from 'node-cron';
import { db } from '../config/database';
import { config } from '../config/env';
import { ScheduledPublisher } from '../services/ScheduledPublisher';
import { kathmanduTodayIso } from '../utils/dates';
import { logger } from '../utils/logger';
import { designQueue } from './designQueue';

export function startScheduledTasks() {
  const [hour, minute] = config.scheduled_check_time.split(':');
  const cronExpression = `${minute} ${hour} * * *`;

  cron.schedule(cronExpression, async () => {
    logger.info('Running scheduled event check...');

    try {
      const schoolsResult = await db.query('SELECT id FROM schools');
      const today = kathmanduTodayIso();

      for (const school of schoolsResult.rows) {
        const eventsResult = await db.query(
          'SELECT * FROM events WHERE school_id = $1 AND event_date = $2',
          [school.id, today],
        );

        for (const event of eventsResult.rows) {
          const existingResult = await db.query(
            `SELECT * FROM design_requests WHERE event_id = $1 AND DATE(requested_at) = CURRENT_DATE`,
            [event.id],
          );

          if (existingResult.rows.length === 0) {
            const designRequestResult = await db.query(
              `INSERT INTO design_requests (school_id, event_id, design_type, status)
               VALUES ($1, $2, $3, $4) RETURNING id`,
              [school.id, event.id, 'poster', 'PENDING'],
            );

            const designJobResult = await db.query(
              `INSERT INTO design_jobs (design_request_id, status) VALUES ($1, $2) RETURNING id`,
              [designRequestResult.rows[0].id, 'QUEUED'],
            );

            const jobId = designJobResult.rows[0].id;

            await designQueue.add(
              { jobId, designRequestId: designRequestResult.rows[0].id },
              { attempts: config.max_retries, backoff: { type: 'exponential', delay: 2000 } },
            );

            logger.info(`Queued design job for event: ${event.name}`);
          }
        }
      }
    } catch (error) {
      logger.error('Scheduled event check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  cron.schedule(config.publish_check_cron, async () => {
    logger.info('Running scheduled social publish check...');
    try {
      await ScheduledPublisher.processDueEntries();
    } catch (error) {
      logger.error('Scheduled publish check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  logger.info(
    `Scheduled tasks configured: event check ${config.scheduled_check_time}, publish check ${config.publish_check_cron}`,
  );
}

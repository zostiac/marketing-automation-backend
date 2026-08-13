import { Request, Response } from 'express';
import { db } from '../config/database';
import { designQueue } from '../queues/designQueue';
import { config } from '../config/env';
import { DesignJobCleanup } from '../services/DesignJobCleanup';
import { AppError } from '../utils/errors';
import { isUuid } from '../utils/helpers';

export class JobController {
  static async getJobStatus(req: Request, res: Response) {
    const result = await db.query('SELECT * FROM design_jobs WHERE id = $1', [
      req.params.id,
    ]);
    if (!result.rows.length) throw AppError.notFound('Job not found');
    res.json(result.rows[0]);
  }

  static async retryJob(req: Request, res: Response) {
    const result = await db.query(
      `UPDATE design_jobs SET status = $1, retry_count = 0 WHERE id = $2 RETURNING *`,
      ['QUEUED', req.params.id],
    );

    if (!result.rows.length) throw AppError.notFound('Job not found');

    const job = result.rows[0];

    await designQueue.add(
      { jobId: job.id, designRequestId: job.design_request_id },
      { attempts: config.max_retries, backoff: { type: 'exponential', delay: 2000 } },
    );

    res.json({ status: 'QUEUED' });
  }

  /** DELETE /api/jobs/:id — removes a single FAILED job and its dependent rows. */
  static async deleteJob(req: Request, res: Response) {
    const jobId = req.params.id;
    if (!isUuid(jobId)) throw AppError.badRequest('Job id must be a UUID');

    const result = await DesignJobCleanup.deleteFailedJob(jobId);
    res.json(result);
  }

  /** DELETE /api/jobs/failed?olderThanDays= — bulk cleanup of failed jobs. */
  static async deleteFailedJobs(req: Request, res: Response) {
    const raw = req.query.olderThanDays;
    let olderThanDays: number | undefined;

    if (raw !== undefined && raw !== '') {
      const parsed = Number(raw);
      if (!Number.isInteger(parsed) || parsed < 0) {
        throw AppError.badRequest('olderThanDays must be a non-negative integer');
      }
      olderThanDays = parsed;
    }

    const result = await DesignJobCleanup.deleteAllFailedJobs(olderThanDays);
    res.json(result);
  }
}

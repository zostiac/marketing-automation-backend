import { Request, Response } from 'express';
import { db } from '../config/database';
import { designQueue } from '../queues/designQueue';
import { config } from '../config/env';
import { AppError } from '../utils/errors';

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
}

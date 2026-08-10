import { Request, Response } from 'express';
import { db } from '../config/database';
import { designQueue } from '../queues/designQueue';

export class JobController {
  static async getJobStatus(req: Request, res: Response) {
    try {
      const result = await db.query('SELECT * FROM design_jobs WHERE id = $1', [req.params.id]);
      if (!result.rows.length) return res.status(404).json({ error: 'Job not found' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }

  static async retryJob(req: Request, res: Response) {
    try {
      const result = await db.query(
        `UPDATE design_jobs SET status = $1, retry_count = 0 WHERE id = $2 RETURNING *`,
        ['QUEUED', req.params.id]
      );
      
      if (!result.rows.length) return res.status(404).json({ error: 'Job not found' });
      
      const job = result.rows[0];
      const designRequest = await db.query('SELECT * FROM design_requests WHERE id = $1', [job.design_request_id]);
      
      await designQueue.add(
        { jobId: job.id, designRequestId: job.design_request_id },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );
      
      res.json({ status: 'QUEUED' });
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }
}
import { Request, Response } from 'express';
import { db } from '../config/database';
import { designQueue } from '../queues/designQueue';
import { AssetManager } from '../services/AssetManager';
import { config } from '../config/env';
import { AppError } from '../utils/errors';

export class DesignController {
  static async requestDesign(req: Request, res: Response) {
    const { school_id, event_id, design_type } = req.body;

    const designRequestResult = await db.query(
      `INSERT INTO design_requests (school_id, event_id, design_type, status)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [school_id, event_id, design_type || 'poster', 'PENDING'],
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

    res.status(202).json({ jobId, status: 'QUEUED' });
  }

  static async getDesignStatus(req: Request, res: Response) {
    const result = await db.query('SELECT * FROM design_jobs WHERE id = $1', [
      req.params.id,
    ]);
    if (!result.rows.length) throw AppError.notFound('Job not found');
    res.json(result.rows[0]);
  }

  static async getDesignResult(req: Request, res: Response) {
    const result = await db.query(
      `SELECT a.* FROM assets a
       JOIN design_jobs dj ON a.design_job_id = dj.id
       WHERE dj.id = $1`,
      [req.params.id],
    );

    if (!result.rows.length) throw AppError.notFound('Asset not found');

    const asset = result.rows[0];
    const imageBuffer = await AssetManager.retrieveAsset(
      config.bucket_name,
      asset.storage_location,
    );

    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  }
}

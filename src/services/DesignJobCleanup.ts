import { PoolClient } from 'pg';
import { db } from '../config/database';
import { designQueue } from '../queues/designQueue';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

/** Only jobs in these states may be deleted — running work is never removed. */
export const DELETABLE_STATUSES = ['FAILED'] as const;

export interface DeletedJobSummary {
  id: string;
  design_request_id: string;
  status: string;
  error_message?: string | null;
  created_at?: string | Date | null;
}

export interface DeleteFailedJobsResult {
  deleted: number;
  jobs: DeletedJobSummary[];
  assets_removed: number;
  requests_removed: number;
}

/** True when a job row is in a state the API is allowed to delete. */
export function isDeletableStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return (DELETABLE_STATUSES as readonly string[]).includes(status.toUpperCase());
}

/**
 * Removes the rows that reference a set of design jobs, then the jobs themselves.
 * `generation_history` → `assets` → `design_jobs` is the FK chain, so it has to be
 * unwound in that order; orphaned `design_requests` are cleaned up last.
 */
async function deleteJobRows(
  client: PoolClient,
  jobIds: string[],
): Promise<{ assets_removed: number; requests_removed: number }> {
  if (!jobIds.length) return { assets_removed: 0, requests_removed: 0 };

  const requestIdsResult = await client.query(
    'SELECT DISTINCT design_request_id FROM design_jobs WHERE id = ANY($1::uuid[])',
    [jobIds],
  );
  const requestIds: string[] = requestIdsResult.rows.map((row) => row.design_request_id);

  await client.query(
    `DELETE FROM generation_history
      WHERE asset_id IN (SELECT id FROM assets WHERE design_job_id = ANY($1::uuid[]))`,
    [jobIds],
  );

  const assetsResult = await client.query(
    'DELETE FROM assets WHERE design_job_id = ANY($1::uuid[])',
    [jobIds],
  );

  await client.query('DELETE FROM design_jobs WHERE id = ANY($1::uuid[])', [jobIds]);

  // A design request only exists to carry its jobs; drop the ones left empty.
  const requestsResult = requestIds.length
    ? await client.query(
        `DELETE FROM design_requests dr
          WHERE dr.id = ANY($1::uuid[])
            AND NOT EXISTS (SELECT 1 FROM design_jobs dj WHERE dj.design_request_id = dr.id)`,
        [requestIds],
      )
    : { rowCount: 0 };

  return {
    assets_removed: assetsResult.rowCount ?? 0,
    requests_removed: requestsResult.rowCount ?? 0,
  };
}

/** Best-effort removal of the matching Bull jobs so retries cannot resurrect a deleted row. */
async function discardQueuedJobs(jobIds: string[]): Promise<void> {
  if (!jobIds.length) return;
  const wanted = new Set(jobIds);

  try {
    const queued = await designQueue.getJobs(
      ['waiting', 'delayed', 'failed', 'paused'],
      0,
      1000,
    );
    await Promise.all(
      queued
        .filter((job) => job?.data && wanted.has(String(job.data.jobId)))
        .map((job) => job.remove().catch(() => undefined)),
    );
  } catch (error) {
    logger.warn('Could not clean Bull entries for deleted design jobs', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export class DesignJobCleanup {
  /** Deletes one failed design job. Throws 404 when missing, 409 when not failed. */
  static async deleteFailedJob(jobId: string): Promise<DeleteFailedJobsResult> {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const existing = await client.query(
        'SELECT id, design_request_id, status, error_message, created_at FROM design_jobs WHERE id = $1 FOR UPDATE',
        [jobId],
      );

      if (!existing.rows.length) {
        await client.query('ROLLBACK');
        throw AppError.notFound('Job not found');
      }

      const job = existing.rows[0] as DeletedJobSummary;

      if (!isDeletableStatus(job.status)) {
        await client.query('ROLLBACK');
        throw AppError.conflict(
          `Only failed jobs can be deleted (job is ${job.status})`,
          { status: job.status, deletable: DELETABLE_STATUSES },
        );
      }

      const counts = await deleteJobRows(client, [job.id]);
      await client.query('COMMIT');
      await discardQueuedJobs([job.id]);

      logger.info('Deleted failed design job', { jobId: job.id });
      return { deleted: 1, jobs: [job], ...counts };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  /** Deletes every failed design job, optionally only those older than `olderThanDays`. */
  static async deleteAllFailedJobs(olderThanDays?: number): Promise<DeleteFailedJobsResult> {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const cutoffClause =
        olderThanDays && olderThanDays > 0
          ? `AND created_at < NOW() - ($1 || ' days')::interval`
          : '';
      const params = cutoffClause ? [String(olderThanDays)] : [];

      const failed = await client.query(
        `SELECT id, design_request_id, status, error_message, created_at
           FROM design_jobs
          WHERE status = 'FAILED' ${cutoffClause}
          ORDER BY created_at DESC
            FOR UPDATE`,
        params,
      );

      const jobs = failed.rows as DeletedJobSummary[];
      const jobIds = jobs.map((job) => job.id);
      const counts = await deleteJobRows(client, jobIds);

      await client.query('COMMIT');
      await discardQueuedJobs(jobIds);

      logger.info('Deleted failed design jobs in bulk', { count: jobIds.length });
      return { deleted: jobIds.length, jobs, ...counts };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }
}

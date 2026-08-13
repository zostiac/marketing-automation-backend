import { db } from '../config/database';
import {
  configuredSocialPlatforms,
  SocialMediaService,
  type PublishResults,
  type SocialPlatform,
} from './SocialMediaService';
import { AppError } from '../utils/errors';
import { kathmanduTodayIso } from '../utils/dates';
import { logger } from '../utils/logger';

export interface DueCalendarEntry {
  id: string;
  school_id: string;
  event_id: string;
  scheduled_publish_date: string;
  platforms: string[];
  status: string;
  caption?: string | null;
  hashtags: unknown;
  publish_attempts?: number;
  name?: string;
}

export interface EntryPublishResult {
  entryId: string;
  status: 'published' | 'scheduled' | 'failed' | 'skipped';
  results?: PublishResults;
  error?: string;
}

export interface PublishRunResult {
  processed: number;
  published: number;
  failed: number;
  skipped: number;
  entries: EntryPublishResult[];
}

const MAX_PUBLISH_ATTEMPTS = 3;

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function isPublishDue(
  scheduledPublishDate: string,
  todayIso = kathmanduTodayIso(),
): boolean {
  return scheduledPublishDate.slice(0, 10) <= todayIso;
}

export function selectPublishPlatforms(
  requested: string[],
  configured = configuredSocialPlatforms(),
): SocialPlatform[] {
  const configuredSet = new Set(configured);
  return requested.filter((platform): platform is SocialPlatform =>
    configuredSet.has(platform as SocialPlatform),
  );
}

export class ScheduledPublisher {
  static async processDueEntries(
    todayIso = kathmanduTodayIso(),
  ): Promise<PublishRunResult> {
    const due = await db.query(
      `SELECT cc.*, e.name
       FROM content_calendar cc
       JOIN events e ON e.id = cc.event_id
       WHERE cc.status = 'scheduled'
         AND cc.scheduled_publish_date::date <= $1::date
       ORDER BY cc.scheduled_publish_date ASC`,
      [todayIso],
    );

    const summary: PublishRunResult = {
      processed: due.rows.length,
      published: 0,
      failed: 0,
      skipped: 0,
      entries: [],
    };

    for (const row of due.rows as DueCalendarEntry[]) {
      const result = await this.publishEntry(row.id);
      summary.entries.push(result);
      if (result.status === 'published') summary.published += 1;
      else if (result.status === 'failed') summary.failed += 1;
      else summary.skipped += 1;
    }

    logger.info('Scheduled publish run complete', {
      processed: summary.processed,
      published: summary.published,
      failed: summary.failed,
      skipped: summary.skipped,
    });

    return summary;
  }

  static async publishEntry(entryId: string): Promise<EntryPublishResult> {
    const entryResult = await db.query(
      `SELECT cc.*, e.name
       FROM content_calendar cc
       JOIN events e ON e.id = cc.event_id
       WHERE cc.id = $1`,
      [entryId],
    );

    if (!entryResult.rows.length) {
      throw AppError.notFound('Calendar entry not found');
    }

    const entry = entryResult.rows[0] as DueCalendarEntry;
    const platforms = parseStringArray(entry.platforms);
    const hashtags = parseStringArray(entry.hashtags);
    const attempts = Number(entry.publish_attempts || 0);

    const assetResult = await db.query(
      `SELECT a.storage_location
       FROM assets a
       JOIN design_jobs dj ON a.design_job_id = dj.id
       JOIN design_requests dr ON dj.design_request_id = dr.id
       WHERE dr.event_id = $1
         AND dj.status = 'APPROVED'
       ORDER BY a.created_at DESC
       LIMIT 1`,
      [entry.event_id],
    );

    if (!assetResult.rows.length) {
      return this.markFailed(
        entryId,
        'No approved design asset exists for this event',
      );
    }

    const publishable = selectPublishPlatforms(platforms);
    if (!publishable.length) {
      return this.markFailed(
        entryId,
        platforms.length
          ? `No credentials configured for ${platforms.join(', ')}`
          : 'No publishing platforms were set on this entry',
      );
    }

    const results = await SocialMediaService.publishToAll(
      {
        imageStorageKey: assetResult.rows[0].storage_location,
        caption: entry.caption || entry.name || undefined,
        hashtags,
      },
      publishable,
    );

    const successes = Object.values(results).filter((result) => result?.ok);
    const failures = Object.values(results).filter((result) => result && !result.ok);

    if (successes.length && !failures.length) {
      await db.query(
        `UPDATE content_calendar
         SET status = 'published',
             published_at = CURRENT_TIMESTAMP,
             publish_results = $2::jsonb,
             publish_error = NULL,
             publish_attempts = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [entryId, JSON.stringify(results), attempts + 1],
      );
      return { entryId, status: 'published', results };
    }

    if (successes.length) {
      await db.query(
        `UPDATE content_calendar
         SET status = 'published',
             published_at = CURRENT_TIMESTAMP,
             publish_results = $2::jsonb,
             publish_error = $3,
             publish_attempts = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [
          entryId,
          JSON.stringify(results),
          'Published with partial platform failures',
          attempts + 1,
        ],
      );
      return {
        entryId,
        status: 'published',
        results,
        error: 'Published with partial platform failures',
      };
    }

    const nextAttempts = attempts + 1;
    const error =
      failures.map((result) => result?.error).filter(Boolean).join('; ') ||
      'All configured platforms failed';

    if (nextAttempts >= MAX_PUBLISH_ATTEMPTS) {
      return this.markFailed(entryId, error, results, nextAttempts);
    }

    await db.query(
      `UPDATE content_calendar
       SET publish_results = $2::jsonb,
           publish_error = $3,
           publish_attempts = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [entryId, JSON.stringify(results), error, nextAttempts],
    );

    return { entryId, status: 'scheduled', results, error };
  }

  private static async markFailed(
    entryId: string,
    error: string,
    results?: PublishResults,
    attempts?: number,
  ): Promise<EntryPublishResult> {
    await db.query(
      `UPDATE content_calendar
       SET status = 'failed',
           publish_error = $2,
           publish_results = $3::jsonb,
           publish_attempts = COALESCE($4, publish_attempts + 1, 1),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [entryId, error, results ? JSON.stringify(results) : null, attempts ?? null],
    );
    return { entryId, status: 'failed', results, error };
  }
}

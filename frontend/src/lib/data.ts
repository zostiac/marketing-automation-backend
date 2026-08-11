/**
 * Data-access functions mapped one-for-one to routes implemented by the Express app.
 * PostgreSQL COUNT values are normalised from strings to numbers at this boundary.
 */
import 'server-only';

import { apiFetchOr, schoolApiFetchOr } from './api';
import {
  sampleBranding,
  sampleCalendar,
  sampleJobs,
  sampleMetrics,
  sampleSchoolProfile,
  sampleStats,
} from './sample-data';
import type {
  ApiResult,
  ContentCalendarRecord,
  DesignJob,
  JobMetric,
  SchoolBranding,
  SchoolProfile,
  SystemStats,
} from './types';

type RawSystemStats = Record<keyof SystemStats, number | string>;
type RawJobMetric = Omit<JobMetric, 'count'> & { count: number | string };

function count(value: number | string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getSystemStats(): Promise<ApiResult<SystemStats>> {
  const result = await apiFetchOr<RawSystemStats>('/api/admin/stats', sampleStats);
  return {
    ...result,
    data: {
      schools: count(result.data.schools),
      events: count(result.data.events),
      jobs: count(result.data.jobs),
      assets: count(result.data.assets),
    },
  };
}

export function getRecentJobs(limit = 50): Promise<ApiResult<DesignJob[]>> {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  return apiFetchOr<DesignJob[]>(`/api/admin/jobs/recent?limit=${safeLimit}`, sampleJobs);
}

export async function getJobMetrics(): Promise<ApiResult<JobMetric[]>> {
  const result = await apiFetchOr<RawJobMetric[]>('/api/admin/metrics', sampleMetrics);
  return {
    ...result,
    data: result.data.map((metric) => ({ ...metric, count: count(metric.count) })),
  };
}

export function getCalendar(monthOffset = 0): Promise<ApiResult<ContentCalendarRecord[]>> {
  const safeOffset = Number.isInteger(monthOffset) ? monthOffset : 0;
  return schoolApiFetchOr<ContentCalendarRecord[]>(
    (schoolId) => `/api/calendar/${schoolId}?monthOffset=${safeOffset}`,
    safeOffset === 0 ? sampleCalendar : [],
  );
}

export function getBranding(): Promise<ApiResult<SchoolBranding>> {
  return schoolApiFetchOr<SchoolBranding>(
    (schoolId) => `/api/school/branding/${schoolId}`,
    sampleBranding,
  );
}

export function getSchoolProfile(): Promise<ApiResult<SchoolProfile>> {
  return schoolApiFetchOr<SchoolProfile>(
    (schoolId) => `/api/school/profile/${schoolId}`,
    sampleSchoolProfile,
  );
}

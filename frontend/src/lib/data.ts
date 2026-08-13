/**
 * Data-access functions mapped one-for-one to routes implemented by the Express app.
 * PostgreSQL COUNT values are normalised from strings to numbers at this boundary.
 */
import 'server-only';

import { apiFetchOr, schoolApiFetchOr } from './api';
import {
  sampleBranding,
  sampleCalendar,
  sampleFestivals,
  sampleJobs,
  sampleMetrics,
  sampleSchoolProfile,
  sampleSchools,
  sampleSocialStatus,
  sampleStats,
  sampleSuccessRates,
  sampleToday,
  sampleTodayEvents,
  sampleTopEvents,
} from './sample-data';
import type {
  ApiResult,
  ContentCalendarRecord,
  DesignJob,
  JobMetric,
  NepalFestival,
  NepalToday,
  SchoolBranding,
  SchoolEvent,
  SchoolProfile,
  SocialPlatformStatus,
  SuccessRateRow,
  SystemStats,
  TopEventRow,
} from './types';

type RawSystemStats = Record<keyof SystemStats, number | string>;
type RawJobMetric = Omit<JobMetric, 'count'> & { count: number | string };
type RawSuccessRate = Omit<SuccessRateRow, 'total' | 'successful' | 'success_rate'> & {
  total: number | string;
  successful: number | string;
  success_rate: number | string;
};
type RawTopEvent = Omit<TopEventRow, 'design_count' | 'avg_file_size' | 'quality_approved_count'> & {
  design_count: number | string;
  avg_file_size: number | string | null;
  quality_approved_count: number | string;
};

function count(value: number | string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalCount(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

export function getSchools(): Promise<ApiResult<SchoolProfile[]>> {
  return apiFetchOr<SchoolProfile[]>('/api/schools', sampleSchools);
}

export function getSocialStatus(): Promise<ApiResult<SocialPlatformStatus>> {
  return apiFetchOr<SocialPlatformStatus>('/api/social/status', sampleSocialStatus);
}

export function getToday(): Promise<ApiResult<NepalToday>> {
  return apiFetchOr<NepalToday>('/api/calendar/today', sampleToday);
}

export function getFestivals(year: number, month?: number): Promise<ApiResult<NepalFestival[]>> {
  const params = new URLSearchParams({ year: String(year) });
  if (month !== undefined) params.set('month', String(month));
  return apiFetchOr<NepalFestival[]>(`/api/calendar/festivals?${params}`, sampleFestivals);
}

export function getTodayEvents(): Promise<ApiResult<SchoolEvent[]>> {
  return schoolApiFetchOr<SchoolEvent[]>(
    (schoolId) => `/api/events/${schoolId}/today`,
    sampleTodayEvents,
  );
}

export async function getSuccessRates(): Promise<ApiResult<SuccessRateRow[]>> {
  const result = await schoolApiFetchOr<RawSuccessRate[]>(
    (schoolId) => `/api/analytics/success-rate/${schoolId}`,
    sampleSuccessRates,
  );
  return {
    ...result,
    data: result.data.map((row) => ({
      event_type: row.event_type,
      total: count(row.total),
      successful: count(row.successful),
      success_rate: count(row.success_rate),
    })),
  };
}

export async function getTopEvents(limit = 5): Promise<ApiResult<TopEventRow[]>> {
  const safeLimit = Math.max(1, Math.min(20, Math.trunc(limit)));
  const result = await schoolApiFetchOr<RawTopEvent[]>(
    (schoolId) => `/api/analytics/top-events/${schoolId}?limit=${safeLimit}`,
    sampleTopEvents,
  );
  return {
    ...result,
    data: result.data.map((row) => ({
      id: row.id,
      name: row.name,
      design_count: count(row.design_count),
      avg_file_size: optionalCount(row.avg_file_size),
      quality_approved_count: count(row.quality_approved_count),
    })),
  };
}

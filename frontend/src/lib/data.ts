/** Data-access layer: one function per dashboard section, each with a safe fallback. */
import 'server-only';

import { apiFetchOr } from './api';
import {
  sampleBranding,
  sampleChannels,
  sampleDesigns,
  sampleOccasions,
  sampleRuns,
  sampleStats,
} from './sample-data';
import type {
  ApiResult,
  AutomationRun,
  Branding,
  Channel,
  DashboardStats,
  Design,
  Occasion,
} from './types';

export function getOccasions(): Promise<ApiResult<Occasion[]>> {
  return apiFetchOr<Occasion[]>('/api/occasions', sampleOccasions);
}

export function getDesigns(): Promise<ApiResult<Design[]>> {
  return apiFetchOr<Design[]>('/api/designs', sampleDesigns);
}

export function getChannels(): Promise<ApiResult<Channel[]>> {
  return apiFetchOr<Channel[]>('/api/channels', sampleChannels);
}

export function getRuns(): Promise<ApiResult<AutomationRun[]>> {
  return apiFetchOr<AutomationRun[]>('/api/runs', sampleRuns);
}

export function getBranding(): Promise<ApiResult<Branding>> {
  return apiFetchOr<Branding>('/api/branding', sampleBranding);
}

export function getStats(): Promise<ApiResult<DashboardStats>> {
  return apiFetchOr<DashboardStats>('/api/stats', sampleStats);
}

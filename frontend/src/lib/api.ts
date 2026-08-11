/** Server-only client for the Express API in the repository root. */
import 'server-only';

import type { ApiResult } from './types';

const API_URL = (process.env.API_URL ?? '').replace(/\/$/, '');
const API_TOKEN = process.env.API_TOKEN ?? '';
const SCHOOL_ID = (process.env.SCHOOL_ID ?? '').trim();
const TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS ?? 8000);

export function isApiConfigured(): boolean {
  return API_URL !== '';
}

export function isSchoolConfigured(): boolean {
  return SCHOOL_ID !== '';
}

export function apiBaseUrl(): string {
  return API_URL;
}

export function configuredSchoolId(): string {
  return SCHOOL_ID;
}

/** Fetch JSON from the backend with a timeout. Throws on configuration/HTTP failures. */
export async function apiFetch<T>(
  path: string,
  init: RequestInit & { revalidate?: number } = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error('API_URL is not set. Add it to the frontend environment.');
  }

  const { revalidate, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
        ...rest.headers,
      },
      next: revalidate === undefined ? { revalidate: 0 } : { revalidate },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Backend responded ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch with a clearly labelled contract-shaped sample fallback. */
export async function apiFetchOr<T>(path: string, fallback: T): Promise<ApiResult<T>> {
  if (!API_URL) {
    return { data: fallback, live: false, error: 'API_URL not configured' };
  }

  try {
    return { data: await apiFetch<T>(path), live: true };
  } catch (error) {
    return {
      data: fallback,
      live: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** School-scoped equivalent that also enforces the ID required by backend routes. */
export async function schoolApiFetchOr<T>(
  path: (schoolId: string) => string,
  fallback: T,
): Promise<ApiResult<T>> {
  if (!SCHOOL_ID) {
    return { data: fallback, live: false, error: 'SCHOOL_ID not configured' };
  }
  return apiFetchOr(path(encodeURIComponent(SCHOOL_ID)), fallback);
}

export interface BackendHealth {
  reachable: boolean;
  status?: number;
  latencyMs?: number;
  body?: unknown;
  error?: string;
  url: string;
}

/** Probe the actual Express health route (`GET /health`). */
export async function checkBackendHealth(): Promise<BackendHealth> {
  if (!API_URL) {
    return { reachable: false, error: 'API_URL not configured', url: '(unset)' };
  }

  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/health`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {},
    });
    const body = await res.json().catch(() => undefined);
    return {
      reachable: res.ok,
      status: res.status,
      latencyMs: Date.now() - started,
      body,
      url: API_URL,
    };
  } catch (error) {
    return {
      reachable: false,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
      url: API_URL,
    };
  } finally {
    clearTimeout(timer);
  }
}

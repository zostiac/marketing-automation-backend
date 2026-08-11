/**
 * Server-side API client.
 *
 * Runs on the Next.js server (Server Components / Route Handlers) — never in the
 * browser. That matters for three reasons:
 *   1. No CORS. The browser only ever talks to this Next app's own origin.
 *   2. API_URL and any API_TOKEN stay server-side and are never shipped to the client.
 *   3. The backend can stay on Railway's network without being publicly branded.
 *
 * Every call degrades gracefully: if the backend is down (which it currently is —
 * see vercel-500-diagnosis.md), we return sample data with `live: false` and the
 * UI shows an honest "demo data" banner instead of an error page.
 */
import 'server-only';

import type { ApiResult } from './types';

const API_URL = (process.env.API_URL ?? '').replace(/\/$/, '');
const API_TOKEN = process.env.API_TOKEN ?? '';
const TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS ?? 8000);

export function isApiConfigured(): boolean {
  return API_URL !== '';
}

export function apiBaseUrl(): string {
  return API_URL;
}

/** Fetch JSON from the backend with a timeout. Throws on any failure. */
export async function apiFetch<T>(
  path: string,
  init: RequestInit & { revalidate?: number } = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error('API_URL is not set. Add it in Vercel → Settings → Environment Variables.');
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
      // Dashboard data should be fresh; opt in to caching per-call when useful.
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

/**
 * Fetch with a sample-data fallback. Use this for everything the dashboard renders
 * so a dead backend produces a labelled demo view rather than a crash.
 */
export async function apiFetchOr<T>(path: string, fallback: T): Promise<ApiResult<T>> {
  if (!API_URL) {
    return { data: fallback, live: false, error: 'API_URL not configured' };
  }
  try {
    const data = await apiFetch<T>(path);
    return { data, live: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: fallback, live: false, error: message };
  }
}

export interface BackendHealth {
  reachable: boolean;
  status?: number;
  latencyMs?: number;
  body?: unknown;
  error?: string;
  url: string;
}

/** Probe the backend's /healthz — the endpoint added in env.fixed.ts / app wiring. */
export async function checkBackendHealth(): Promise<BackendHealth> {
  if (!API_URL) {
    return { reachable: false, error: 'API_URL not configured', url: '(unset)' };
  }
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/healthz`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {},
    });
    const latencyMs = Date.now() - started;
    const body = await res.json().catch(() => undefined);
    return { reachable: res.ok, status: res.status, latencyMs, body, url: API_URL };
  } catch (err) {
    return {
      reachable: false,
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
      url: API_URL,
    };
  } finally {
    clearTimeout(timer);
  }
}

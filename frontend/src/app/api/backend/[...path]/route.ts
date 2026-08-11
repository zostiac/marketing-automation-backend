/**
 * Server-side proxy: /api/backend/* → $API_URL/*
 *
 * The UI uses this same-origin route to load generated image bytes from
 * GET /api/designs/:id/result. JSON reads and mutations use the server-only API
 * client directly. API_TOKEN is attached here without entering browser code.
 */
import { NextRequest, NextResponse } from 'next/server';

const API_URL = (process.env.API_URL ?? '').replace(/\/$/, '');
const API_TOKEN = process.env.API_TOKEN ?? '';
const TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS ?? 15000);

/** Headers we refuse to forward upstream. */
const STRIP_REQUEST = new Set(['host', 'connection', 'content-length', 'accept-encoding']);
/** Headers we refuse to send back downstream. */
const STRIP_RESPONSE = new Set(['content-encoding', 'content-length', 'transfer-encoding', 'connection']);

async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
  if (!API_URL) {
    return NextResponse.json(
      {
        error: 'Backend not configured',
        detail: 'API_URL is not set in the frontend environment.',
      },
      { status: 503 },
    );
  }

  const search = req.nextUrl.search;
  const target = `${API_URL}/${path.join('/')}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_REQUEST.has(key.toLowerCase())) headers.set(key, value);
  });
  if (API_TOKEN) headers.set('Authorization', `Bearer ${API_TOKEN}`);

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'manual',
    });

    const outHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!STRIP_RESPONSE.has(key.toLowerCase())) outHeaders.set(key, value);
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    return NextResponse.json(
      {
        error: aborted ? 'Backend timed out' : 'Backend unreachable',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: aborted ? 504 : 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}

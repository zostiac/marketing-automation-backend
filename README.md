# Marketing Automation Backend

AI-powered school marketing automation for **Amar English School** (Devchuli-16, Rajahar, Nawalparasi). The Express API generates occasion-aware social designs, keeps a Nepal/Bikram Sambat content calendar, and can publish approved assets to Facebook, Instagram, and TikTok.

A Next.js control panel lives in [`frontend/`](frontend/README.md).

## Stack

- Node.js 20, TypeScript, Express
- PostgreSQL, Redis + Bull, S3-compatible object storage
- OpenAI (creative direction + DALL·E 3)
- Railway for the API, optional Vercel for the frontend

## Local development

```bash
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

The API listens on `0.0.0.0:${PORT:-3000}`. The frontend also defaults to port 3000, so run the API on another port locally (`PORT=3001`).

| Script | Purpose |
|---|---|
| `npm run dev` | TypeScript server via `ts-node` |
| `npm run build` / `npm start` | Compile and run `dist/index.js` |
| `npm run migrate` | Apply schema + compatibility upgrades + Amar school seed |
| `npm run seed` | Idempotent Amar English School upsert |
| `npm test` | Vitest unit tests |

## Environment

Required in production:

- `DATABASE_URL` (or `DATABASE_PUBLIC_URL` / `DATABASE_PRIVATE_URL`)
- `REDIS_URL` (or `REDIS_PUBLIC_URL` / `REDIS_PRIVATE_URL`)
- `OPENAI_API_KEY`

Important optional variables:

| Variable | Notes |
|---|---|
| `API_TOKEN` | If set, every `/api/*` route requires `Authorization: Bearer …` or `X-API-Key`. If unset, routes stay public and a warning is logged. |
| `OPENAI_CHAT_MODEL` | OpenAI chat model for creative direction (default `gpt-4o`) |
| `OPENAI_IMAGE_MODEL` | OpenAI image model for generated designs (default `dall-e-3`) |
| `BUCKET_*` | S3/Tigris credentials used to store generated PNGs |
| `FACEBOOK_ACCESS_TOKEN` + `FACEBOOK_PAGE_ID` | Page photo publishing |
| `INSTAGRAM_ACCESS_TOKEN` + `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Graph API publishing via a signed image URL |
| `TIKTOK_ACCESS_TOKEN` | Photo posts; JPEG/WEBP only |
| `SCHEDULED_EVENTS_CHECK_TIME` | Daily auto-queue of posters for today's events (Kathmandu) |
| `PUBLISH_CHECK_CRON` | How often due `scheduled` calendar entries are published (default every 15 minutes) |

See [`.env.example`](.env.example) for the full list.

## Auth

`GET /health` and `GET /health/ready` are always public.

When `API_TOKEN` is configured, send:

```http
Authorization: Bearer $API_TOKEN
```

The frontend already forwards `API_TOKEN` from its server environment.

## HTTP API

Existing frontend contracts are unchanged (`snake_case` JSON, same paths and status codes).

### Health

- `GET /health` — process liveness (Railway)
- `GET /health/ready` — Postgres + Redis readiness

### Schools, events, designs

- `GET /api/schools`
- `POST /api/school` — create; `?upsert=true` updates by name
- `GET/PUT /api/school/profile/:id`
- `GET /api/school/branding/:id`
- `GET /api/events?schoolId=`
- `POST /api/events`
- `GET /api/events/:schoolId/today` — today's events in `Asia/Kathmandu`
- `GET/PUT/DELETE /api/events/:id`
- `POST /api/designs/request` `{ school_id, event_id, design_type }`
- `GET /api/designs/:id/status`
- `GET /api/designs/:id/result` — PNG bytes
- `GET /api/jobs/:id/status`
- `POST /api/jobs/:id/retry`

### Admin and analytics

- `GET /api/admin/stats`
- `GET /api/admin/jobs/recent?limit=`
- `GET /api/admin/jobs/failed`
- `GET /api/admin/metrics`
- `GET /api/analytics/designs/:schoolId?startDate=&endDate=`
- `GET /api/analytics/success-rate/:schoolId`
- `GET /api/analytics/top-events/:schoolId?limit=`

### Calendar and festivals

- `GET /api/calendar/today` — AD + Bikram Sambat today
- `GET /api/calendar/festivals?year=2083&month=`
- `GET /api/calendar/:schoolId` — Gregorian month (`monthOffset`)
- `GET /api/calendar/:schoolId/nepali?year=2083&month=5` — full BS month with festivals
- `POST /api/calendar/entry`
- `POST /api/calendar/schedule-publish`
- `POST /api/calendar/sync-festivals` — import curated Nepal festivals as events; set `createCalendarEntries: true` to also create draft calendar rows
- `POST /api/calendar/publish-due` — publish every due `scheduled` entry
- `POST /api/calendar/entries/:id/publish`

### Social

- `GET /api/social/status` — which platforms have credentials (never returns tokens)
- `POST /api/social/publish`
- `POST /api/social/publish-batch`

## How a design is produced

1. `POST /api/designs/request` writes `design_requests` + `design_jobs` and enqueues a Bull job.
2. The worker asks GPT for creative direction, builds a prompt, and generates a DALL·E 3 image.
3. The PNG is stored in S3 and recorded in `assets`. An optional quality check can mark it approved.
4. A daily cron (Kathmandu date) auto-queues a poster for each school event happening today.
5. A separate cron publishes due `content_calendar` rows that already have an approved asset and configured platform credentials.

Festival sync uses the curated 2083 BS dataset in `src/data/nepalFestivals.ts`.

## Deploy

Railway uses `railway.json` (`npm run build`, `node dist/index.js`, health check `/health`). After the first deploy run `npm run migrate` against the Railway database (or exec it in the service) so schema columns such as `publish_results` exist.

## Current limits

- Social credentials are still supplied by the owner; platforms without tokens are skipped.
- TikTok photo posts reject PNG assets until a JPEG/WEBP conversion step is added.
- There is no user login — only the optional shared `API_TOKEN`.
- Scheduled publishing needs an approved design for the event and live platform credentials.

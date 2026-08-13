# Marketing Automation — Frontend

Next.js 16 (App Router), TypeScript, and Tailwind 4 control panel for the Express backend in the repository root.

## Backend contract

The frontend calls routes that actually exist in `src/routes/index.ts`:

| Frontend section | Backend route |
|---|---|
| Health | `GET /health` |
| Dashboard totals | `GET /api/admin/stats` |
| Recent jobs | `GET /api/admin/jobs/recent?limit=…` |
| Job metrics | `GET /api/admin/metrics` |
| Schools | `GET /api/schools` |
| Today (AD + BS) | `GET /api/calendar/today` |
| Festivals | `GET /api/calendar/festivals?year=&month=` |
| Calendar | `GET /api/calendar/:schoolId?monthOffset=…` |
| Today's events | `GET /api/events/:schoolId/today` |
| Social credentials | `GET /api/social/status` |
| Success rates | `GET /api/analytics/success-rate/:schoolId` |
| Top events | `GET /api/analytics/top-events/:schoolId` |
| School profile | `GET /api/school/profile/:id` |
| Branding | `GET /api/school/branding/:id` |
| Generate design | `POST /api/designs/request` |
| Retry failed job | `POST /api/jobs/:id/retry` |
| Sync festivals | `POST /api/calendar/sync-festivals` |
| Publish entry | `POST /api/calendar/entries/:id/publish` |
| Publish due | `POST /api/calendar/publish-due` |
| Generated PNG | `GET /api/designs/:id/result` |

Database/API fields remain in snake_case in `src/lib/types.ts`, matching Express responses. PostgreSQL `COUNT` strings are converted to numbers in `src/lib/data.ts`.

The backend does **not** expose `GET /api/occasions`, `/api/designs`, `/api/channels`, `/api/runs`, `/api/branding`, `/api/stats`, or `/healthz`; the frontend does not call or advertise those routes.

## Pages

| Route | Purpose |
|---|---|
| `/` | Global totals, current-month calendar entries, and recent jobs |
| `/calendar` | Month navigation, Nepal festivals, festival sync, and publish actions |
| `/designs` | Recent design job states, generated PNGs, downloads, and failed-job retries |
| `/history` | Recent `design_jobs` rows and aggregate status metrics |
| `/settings` | `/health` probe, frontend configuration, school profile, and branding |
| `/occasions` | Redirects old bookmarks to `/calendar` |

## Local development

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Then open <http://localhost:3000>. The backend defaults to port 3000 too, so run one of the services on another port during local development (for example, backend `PORT=3001` and frontend `API_URL=http://localhost:3001`).

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `API_URL` | Yes | Backend base URL, no trailing `/api` or slash |
| `SCHOOL_ID` | Yes for school data | UUID from the backend `schools.id` column |
| `API_TOKEN` | No | Forwarded as `Authorization: Bearer …` if backend auth is added |
| `API_TIMEOUT_MS` | No | Default `8000` |

Do not add a `NEXT_PUBLIC_` prefix. Values are read by Server Components, Server Actions, and Route Handlers and are not bundled into browser JavaScript.

For Vercel, use the backend's public Railway domain (`*.up.railway.app`), not a Railway private-network hostname. Add `API_URL` and `SCHOOL_ID` to each required Vercel environment and redeploy.

## Architecture

```text
Browser ──► Next.js
             ├── Server Components ──► Express JSON endpoints
             ├── Server Actions ─────► Express mutation endpoints
             └── /api/backend/* ─────► Express generated-image endpoint
```

- `src/lib/api.ts` — server-only fetch client, `/health` probe, timeout, and configuration helpers
- `src/lib/data.ts` — exact route mapping plus count normalisation
- `src/lib/types.ts` — Express response contracts
- `src/app/actions.ts` — generate and retry mutations using backend request field names
- `src/app/api/backend/[...path]/route.ts` — same-origin proxy used for generated image bytes
- `src/lib/sample-data.ts` — contract-shaped fallback values, always identified by the warning banner

## Production notes

- Add authentication before exposing the dashboard publicly. The current backend routes are only protected when `API_TOKEN` is set.
- Discover school UUIDs from `GET /api/schools` on the Settings page, then set `SCHOOL_ID`.
- Channel credentials stay in backend environment variables. Settings shows `GET /api/social/status` (configured flags only, never tokens) plus `social_media_info` profile metadata.

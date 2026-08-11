# Marketing Automation — Frontend

Next.js 16 (App Router) + TypeScript + Tailwind 4 control panel for Amar English School's
marketing automation backend.

## Why Next.js and not Vite

Vercel builds and maintains Next.js, so deploys are zero-config. More importantly, Next
gives you a **server layer** — and that's what makes the backend connection clean:

| | Next.js (chosen) | Vite SPA |
|---|---|---|
| CORS setup | none needed | must configure on backend for every preview URL |
| API URL / token | stays server-side | shipped in the JS bundle, visible in devtools |
| Backend down | page still renders | white screen or client-side error |
| Auth later | HTTP-only cookies work | token in localStorage (XSS-exposed) |

Your backend URL and any API token never reach the browser.

## Pages

| Route | What it does |
|---|---|
| `/` | Stats, upcoming occasions, automation status, recent designs |
| `/occasions` | Detected festivals + manual campaigns, split upcoming/past |
| `/designs` | Poster grid; approve / reject / regenerate / download / send |
| `/history` | Full run log — every step, duration, and failure message |
| `/settings` | **Live backend health probe**, branding, channel connections |

## Local development

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
```

Runs fine with **no backend**. Every page falls back to sample data and shows an amber
"showing sample data" banner, so demo figures are never mistaken for real ones.

To point at a real backend, create `.env.local`:

```bash
API_URL=http://localhost:3001
```

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `API_URL` | yes | Backend base URL, no trailing slash |
| `API_TOKEN` | no | Sent as `Authorization: Bearer …` |
| `API_TIMEOUT_MS` | no | Default `8000` |

⚠️ **No `NEXT_PUBLIC_` prefix.** That prefix would inline the value into the client bundle.
These are read server-side only — that's the whole point.

⚠️ **Use the public Railway domain** (`*.up.railway.app`), not `*.railway.internal`.
Vercel functions run outside Railway's private network and can't resolve internal hostnames.

## Deploying to Vercel

1. **New Project** → import the same GitHub repo (a second Vercel project on one repo is fine).
2. **Root Directory** → `frontend`. Framework preset auto-detects as Next.js.
3. **Environment Variables** → add `API_URL` to Production, Preview, and Development.
4. Deploy.

Then handle the old `marketing-automation-backend` Vercel project — it's the one throwing
500s. Delete it, or repoint its Root Directory at `frontend` and reuse it. Don't leave it
failing.

**Optional** — skip rebuilds when only backend code changed. Settings → Git → Ignored Build Step:

```bash
git diff --quiet HEAD^ HEAD -- ./frontend
```

## Architecture

```
Browser ──► Vercel (Next.js) ──► Railway (Express + Postgres + Redis)
             │
             ├── Server Components call src/lib/data.ts directly
             └── Client Components POST to /api/backend/* (proxy route)
```

- `src/lib/api.ts` — server-only fetch client with timeout + graceful fallback
- `src/lib/data.ts` — one function per section, each with sample-data fallback
- `src/app/api/backend/[...path]/route.ts` — proxy for client-side mutations
- `src/lib/sample-data.ts` — demo data, only used when the backend is unreachable

### Wiring up the real endpoints

`src/lib/data.ts` currently expects these routes. Adjust the paths to match your Express app:

```
GET /api/occasions   → Occasion[]
GET /api/designs     → Design[]
GET /api/channels    → Channel[]
GET /api/runs        → AutomationRun[]
GET /api/branding    → Branding
GET /api/stats       → DashboardStats
GET /healthz         → { status, config }
```

Shapes are in `src/lib/types.ts`. Once the backend returns real data the sample fallback
stops being used automatically and the amber banner disappears — no code change needed.

### Making the buttons work

Approve/reject/regenerate are currently non-functional placeholders. To wire one up, add a
Server Action rather than a client fetch:

```tsx
async function approve(formData: FormData) {
  'use server';
  await apiFetch(`/api/designs/${formData.get('id')}/approve`, { method: 'POST' });
  revalidatePath('/designs');
}
```

Server Actions keep the token server-side and refresh the page data automatically.

## Before production

- [ ] Add authentication — the dashboard is currently public to anyone with the URL
- [ ] Point `API_URL` at the live backend and confirm `/settings` shows **Healthy**
- [ ] Replace poster placeholders with real `imageUrl` values from the backend
- [ ] Consider `revalidate` values in `src/lib/api.ts` if you want caching over freshness

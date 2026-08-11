import { ChannelBadge } from '@/components/status';
import { Badge, Button, Card, CardHeader } from '@/components/ui';
import { checkBackendHealth, isApiConfigured } from '@/lib/api';
import { getBranding, getChannels } from '@/lib/data';
import { formatDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

/** Mask a URL so the page can be screenshotted without leaking credentials. */
function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url;
  }
}

export default async function SettingsPage() {
  const [health, branding, channels] = await Promise.all([
    checkBackendHealth(),
    getBranding(),
    getChannels(),
  ]);

  const configured = isApiConfigured();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Settings</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Backend connection, school branding, and outreach channels.
        </p>
      </div>

      {/* Connection diagnostics */}
      <Card className="mb-6">
        <CardHeader
          title="Backend Connection"
          icon={<span aria-hidden>🔌</span>}
          description="Live probe of your API's /healthz endpoint"
          action={
            <Badge tone={health.reachable ? 'green' : 'red'}>
              {health.reachable ? 'Healthy' : configured ? 'Unreachable' : 'Not configured'}
            </Badge>
          }
        />
        <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <div className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-slate-500 dark:text-slate-400">API URL</dt>
            <dd className="truncate font-mono text-xs text-slate-900 dark:text-slate-100">
              {configured ? maskUrl(health.url) : 'not set'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-slate-500 dark:text-slate-400">HTTP status</dt>
            <dd className="font-mono text-xs text-slate-900 dark:text-slate-100">
              {health.status ?? '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-slate-500 dark:text-slate-400">Latency</dt>
            <dd className="font-mono text-xs tabular-nums text-slate-900 dark:text-slate-100">
              {health.latencyMs !== undefined ? `${health.latencyMs}ms` : '—'}
            </dd>
          </div>
          {health.error ? (
            <div className="px-5 py-3">
              <dt className="mb-1 text-slate-500 dark:text-slate-400">Error</dt>
              <dd className="rounded bg-red-50 px-2 py-1.5 font-mono text-[11px] text-red-700 dark:bg-red-950 dark:text-red-300">
                {health.error}
              </dd>
            </div>
          ) : null}
        </dl>

        {!health.reachable ? (
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
            <p className="mb-2 font-semibold text-slate-900 dark:text-slate-100">To fix:</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>
                Set <code className="rounded bg-slate-200 px-1 font-mono dark:bg-slate-700">API_URL</code>{' '}
                in Vercel → Settings → Environment Variables (all environments).
              </li>
              <li>
                Make sure the backend itself has{' '}
                <code className="rounded bg-slate-200 px-1 font-mono dark:bg-slate-700">DATABASE_URL</code>,{' '}
                <code className="rounded bg-slate-200 px-1 font-mono dark:bg-slate-700">REDIS_URL</code>, and{' '}
                <code className="rounded bg-slate-200 px-1 font-mono dark:bg-slate-700">OPENAI_API_KEY</code>.
              </li>
              <li>Redeploy — env changes only apply to new deployments.</li>
            </ol>
          </div>
        ) : null}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Branding */}
        <Card>
          <CardHeader
            title="School Branding"
            icon={<span aria-hidden>🏫</span>}
            description="Applied to every generated poster"
            action={<Button>Edit</Button>}
          />
          <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <div className="flex justify-between gap-4 px-5 py-3">
              <dt className="text-slate-500 dark:text-slate-400">School name</dt>
              <dd className="text-right text-slate-900 dark:text-slate-100">
                {branding.data.schoolName}
              </dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-3">
              <dt className="text-slate-500 dark:text-slate-400">Tagline</dt>
              <dd className="text-right text-slate-900 dark:text-slate-100">
                {branding.data.tagline}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-slate-500 dark:text-slate-400">Colours</dt>
              <dd className="flex items-center gap-2">
                <span
                  className="h-5 w-5 rounded border border-slate-300 dark:border-slate-600"
                  style={{ backgroundColor: branding.data.primaryColor }}
                  title={branding.data.primaryColor}
                />
                <span
                  className="h-5 w-5 rounded border border-slate-300 dark:border-slate-600"
                  style={{ backgroundColor: branding.data.secondaryColor }}
                  title={branding.data.secondaryColor}
                />
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {branding.data.primaryColor}
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-3">
              <dt className="text-slate-500 dark:text-slate-400">Contact</dt>
              <dd className="text-right text-xs text-slate-900 dark:text-slate-100">
                <p>{branding.data.email}</p>
                <p className="text-slate-500 dark:text-slate-400">{branding.data.phone}</p>
              </dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-3">
              <dt className="text-slate-500 dark:text-slate-400">Address</dt>
              <dd className="text-right text-xs text-slate-900 dark:text-slate-100">
                {branding.data.address}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Channels */}
        <Card>
          <CardHeader
            title="Channels"
            icon={<span aria-hidden>📡</span>}
            description="Where approved posters get published"
          />
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {channels.data.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {c.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {c.detail}
                    {c.lastUsedAt ? ` · last used ${formatDateTime(c.lastUsedAt)}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ChannelBadge status={c.status} />
                  <Button>{c.status === 'connected' ? 'Manage' : 'Connect'}</Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

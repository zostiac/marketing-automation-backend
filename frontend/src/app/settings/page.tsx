import { Palette, Plug, Puzzle, Radio, School } from 'lucide-react';
import { ConnectionBanner } from '@/components/connection-banner';
import { SocialStatusBadges } from '@/components/status';
import { Badge, Card, CardHeader, EmptyState } from '@/components/ui';
import {
  checkBackendHealth,
  configuredSchoolId,
  isApiConfigured,
  isSchoolConfigured,
} from '@/lib/api';
import { getBranding, getSchoolProfile, getSchools, getSocialStatus } from '@/lib/data';
import { formatDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
}

function healthStatus(body: unknown): string {
  if (body && typeof body === 'object' && 'status' in body) return String(body.status);
  return '—';
}

function ObjectRows({ value }: { value?: Record<string, unknown> | null }) {
  const rows = Object.entries(value ?? {});
  if (!rows.length) return <EmptyState message="Not configured." />;

  return (
    <dl className="divide-y divide-border text-sm">
      {rows.map(([key, item]) => (
        <div key={key} className="flex items-start justify-between gap-4 px-5 py-3">
          <dt className="text-muted-foreground">{key.replaceAll('_', ' ')}</dt>
          <dd className="max-w-[65%] break-words text-right text-xs text-foreground">
            {typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
              ? String(item)
              : JSON.stringify(item)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function SettingsPage() {
  const [health, branding, profile, schools, social] = await Promise.all([
    checkBackendHealth(),
    getBranding(),
    getSchoolProfile(),
    getSchools(),
    getSocialStatus(),
  ]);
  const apiConfigured = isApiConfigured();
  const schoolConfigured = isSchoolConfigured();
  const schoolDataLive = branding.live && profile.live;
  const schoolError = [branding.error, profile.error, schools.error, social.error]
    .filter(Boolean)
    .join(' · ') || undefined;
  const colors = Object.entries(branding.data.brand_colors ?? {});
  const selectedSchoolId = configuredSchoolId();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Express connection diagnostics and school fields returned by the profile APIs.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader
          title="Backend Connection"
          icon={<Plug className="h-4 w-4" />}
          description="Live probe of the backend's GET /health route"
          action={
            <Badge tone={health.reachable ? 'green' : 'red'}>
              {health.reachable ? 'Healthy' : apiConfigured ? 'Unreachable' : 'Not configured'}
            </Badge>
          }
        />
        <dl className="divide-y divide-border text-sm">
          <div className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-muted-foreground">API URL</dt>
            <dd className="truncate font-mono text-xs text-foreground">
              {apiConfigured ? maskUrl(health.url) : 'not set'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-muted-foreground">School ID</dt>
            <dd className="truncate font-mono text-xs text-foreground" title={configuredSchoolId()}>
              {schoolConfigured ? configuredSchoolId() : 'not set'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-muted-foreground">HTTP / service status</dt>
            <dd className="font-mono text-xs text-foreground">
              {health.status ?? '—'} / {healthStatus(health.body)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-muted-foreground">Latency</dt>
            <dd className="font-mono text-xs tabular-nums text-foreground">
              {health.latencyMs !== undefined ? `${health.latencyMs}ms` : '—'}
            </dd>
          </div>
          {health.error ? (
            <div className="px-5 py-3">
              <dt className="mb-1 text-muted-foreground">Error</dt>
              <dd className="rounded-md bg-danger-muted px-2 py-1.5 font-mono text-[11px] text-danger">
                {health.error}
              </dd>
            </div>
          ) : null}
        </dl>

        {!health.reachable || !schoolConfigured ? (
          <div className="border-t border-border bg-muted/50 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
            <p className="mb-2 font-semibold text-foreground">Frontend environment checklist</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Set <code className="rounded bg-muted px-1 font-mono">API_URL</code> to the backend base URL (without <code>/api</code>).</li>
              <li>Set <code className="rounded bg-muted px-1 font-mono">SCHOOL_ID</code> to a UUID from GET /api/schools (listed below when the API is reachable).</li>
              <li>Redeploy after changing environment variables.</li>
            </ol>
          </div>
        ) : null}
      </Card>

      <ConnectionBanner
        live={schoolDataLive}
        error={schoolError}
        configured={apiConfigured}
        requiresSchool
        schoolConfigured={schoolConfigured}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="School Profile"
            icon={<School className="h-4 w-4" />}
            description="GET /api/school/profile/:id"
          />
          <dl className="divide-y divide-border text-sm">
            <div className="flex justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-right text-foreground">{profile.data.name}</dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Tagline</dt>
              <dd className="text-right text-foreground">{profile.data.tagline || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Location</dt>
              <dd className="text-right text-foreground">{profile.data.location || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Visual style</dt>
              <dd className="text-right text-foreground">{profile.data.visual_style || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Updated</dt>
              <dd className="text-right text-xs text-foreground">{formatDateTime(profile.data.updated_at)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader
            title="Branding"
            icon={<Palette className="h-4 w-4" />}
            description="GET /api/school/branding/:id"
          />
          <div className="space-y-4 p-5">
            {branding.data.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={branding.data.logo_url} alt={`${branding.data.name} logo`} className="max-h-24 max-w-48 object-contain" />
            ) : (
              <p className="text-xs text-muted-foreground">No official logo URL configured.</p>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Brand colours</p>
              {colors.length ? (
                <div className="mt-2 flex flex-wrap gap-3">
                  {colors.map(([name, color]) => (
                    <div key={name} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-6 w-6 rounded border border-border" style={{ backgroundColor: color }} />
                      <span>{name}: <code className="text-foreground">{color}</code></span>
                    </div>
                  ))}
                </div>
              ) : <p className="mt-1 text-xs text-muted-foreground">Not configured.</p>}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Typography</p>
              <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-[11px] text-muted-foreground">
                {JSON.stringify(branding.data.typography ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Design Preferences" icon={<Puzzle className="h-4 w-4" />} />
          <ObjectRows value={profile.data.design_preferences} />
        </Card>

        <Card>
          <CardHeader
            title="Social platform credentials"
            icon={<Radio className="h-4 w-4" />}
            description="GET /api/social/status — configured flags only, never tokens"
          />
          <div className="space-y-4 p-5">
            <SocialStatusBadges status={social.data} />
            <p className="text-xs text-muted-foreground">
              Profile handles below are metadata from the school record, not live OAuth state.
            </p>
          </div>
          <ObjectRows value={profile.data.social_media_info} />
        </Card>

        <Card>
          <CardHeader
            title="Registered schools"
            icon={<School className="h-4 w-4" />}
            description="GET /api/schools — use an id as SCHOOL_ID"
          />
          {schools.data.length === 0 ? (
            <EmptyState message="No schools returned." />
          ) : (
            <ul className="divide-y divide-border">
              {schools.data.map((school) => {
                const selected = school.id === selectedSchoolId;
                return (
                  <li key={school.id} className="flex items-start justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{school.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground" title={school.id}>
                        {school.id}
                      </p>
                      {school.location ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">{school.location}</p>
                      ) : null}
                    </div>
                    {selected ? <Badge tone="green">Selected</Badge> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

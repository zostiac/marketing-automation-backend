import Link from 'next/link';
import { ConnectionBanner } from '@/components/connection-banner';
import { DesignBadge, OccasionBadge, RunBadge } from '@/components/status';
import { Button, Card, CardHeader, EmptyState, StatTile } from '@/components/ui';
import { isApiConfigured } from '@/lib/api';
import { getDesigns, getOccasions, getRuns, getStats } from '@/lib/data';
import { formatDate, formatDateTime, relativeDays } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [stats, occasions, designs, runs] = await Promise.all([
    getStats(),
    getOccasions(),
    getDesigns(),
    getRuns(),
  ]);

  const live = stats.live && occasions.live;
  const now = new Date();

  const upcoming = occasions.data
    .filter((o) => o.status !== 'completed' && o.status !== 'skipped')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 5);

  const recentDesigns = designs.data.slice(0, 4);
  const needsApproval = designs.data.filter((d) => d.status === 'pending_approval').length;
  const latestRuns = runs.data.slice(0, 4);

  return (
    <>
      <ConnectionBanner live={live} error={occasions.error} configured={isApiConfigured()} />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Occasions detected, designs generated, and what went out the door.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Upcoming"
          value={stats.data.upcomingOccasions}
          sublabel="occasions detected"
          tone="blue"
        />
        <StatTile
          label="Needs approval"
          value={needsApproval || stats.data.pendingApproval}
          sublabel="designs waiting"
          tone={needsApproval > 0 ? 'violet' : 'neutral'}
        />
        <StatTile
          label="Posters"
          value={stats.data.postersThisMonth}
          sublabel="this month"
          tone="green"
        />
        <StatTile
          label="Last email"
          value={stats.data.lastEmailSentAt ? formatDate(stats.data.lastEmailSentAt) : '—'}
          sublabel={stats.data.lastEmailSentAt ? relativeDays(stats.data.lastEmailSentAt, now) : 'never sent'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Occasions */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader
              title="Upcoming Occasions"
              icon={<span aria-hidden>📅</span>}
              description="Auto-detected festivals and manually added campaigns"
              action={
                <Link href="/occasions">
                  <Button>View all</Button>
                </Link>
              }
            />
            {upcoming.length === 0 ? (
              <EmptyState message="No upcoming occasions." hint="The detector runs daily." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcoming.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                          {o.name}
                        </p>
                        {o.nameNepali ? (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {o.nameNepali}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(o.date)} · {relativeDays(o.date, now)}
                        {o.designCount > 0 ? ` · ${o.designCount} design${o.designCount > 1 ? 's' : ''}` : ''}
                      </p>
                    </div>
                    <OccasionBadge status={o.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Automation status */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Automation Status"
              icon={<span aria-hidden>⚡</span>}
              description="Most recent pipeline steps"
              action={
                <Link href="/history">
                  <Button>History</Button>
                </Link>
              }
            />
            {latestRuns.length === 0 ? (
              <EmptyState message="No runs yet." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {latestRuns.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-900 dark:text-slate-100">
                        {r.step}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {r.occasionName} · {formatDateTime(r.startedAt)}
                      </p>
                      {r.message ? (
                        <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                          {r.message}
                        </p>
                      ) : null}
                    </div>
                    <RunBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Designs */}
      <div className="mt-6">
        <Card>
          <CardHeader
            title="Recent Designs"
            icon={<span aria-hidden>🎨</span>}
            description="Generated posters awaiting review or already approved"
            action={
              <Link href="/designs">
                <Button>View all</Button>
              </Link>
            }
          />
          {recentDesigns.length === 0 ? (
            <EmptyState message="No designs generated yet." />
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              {recentDesigns.map((d) => (
                <div
                  key={d.id}
                  className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    {d.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.imageUrl}
                        alt={d.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-3 text-center text-xs text-slate-400 dark:text-slate-600">
                        {d.status === 'generating' ? 'Generating…' : 'No preview'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                      {d.title}
                    </p>
                    <DesignBadge status={d.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

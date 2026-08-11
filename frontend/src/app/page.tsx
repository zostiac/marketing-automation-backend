import Link from 'next/link';
import { ConnectionBanner } from '@/components/connection-banner';
import { CalendarBadge, DesignJobBadge } from '@/components/status';
import { Card, CardHeader, EmptyState, StatTile } from '@/components/ui';
import { isApiConfigured, isSchoolConfigured } from '@/lib/api';
import { getCalendar, getRecentJobs, getSystemStats } from '@/lib/data';
import { formatDate, formatDateTime, relativeDays } from '@/lib/format';

export const dynamic = 'force-dynamic';

const linkButton =
  'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';

function shortId(id: string): string {
  return `${id.slice(0, 8)}…`;
}

export default async function DashboardPage() {
  const [stats, calendar, jobs] = await Promise.all([
    getSystemStats(),
    getCalendar(),
    getRecentJobs(20),
  ]);

  const live = stats.live && calendar.live && jobs.live;
  const error = [stats.error, calendar.error, jobs.error].filter(Boolean).join(' · ') || undefined;
  const now = new Date();
  const calendarEntries = [...calendar.data]
    .sort(
      (a, b) =>
        +new Date(a.scheduled_publish_date) - +new Date(b.scheduled_publish_date),
    )
    .slice(0, 5);
  const recentJobs = [...jobs.data]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 5);
  const approvedJobs = recentJobs.filter((job) => job.status.toUpperCase() === 'APPROVED').length;
  const failedJobs = recentJobs.filter((job) => job.status.toUpperCase() === 'FAILED').length;

  return (
    <>
      <ConnectionBanner
        live={live}
        error={error}
        configured={isApiConfigured()}
        requiresSchool
        schoolConfigured={isSchoolConfigured()}
      />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Live system totals, this month&apos;s content calendar, and recent design jobs.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Schools" value={stats.data.schools} sublabel="registered" tone="blue" />
        <StatTile label="Events" value={stats.data.events} sublabel="in the database" tone="violet" />
        <StatTile label="Design jobs" value={stats.data.jobs} sublabel="all time" tone="amber" />
        <StatTile label="Assets" value={stats.data.assets} sublabel="generated files" tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader
              title="Content Calendar"
              icon={<span aria-hidden>📅</span>}
              description="Entries returned by GET /api/calendar/:schoolId for this month"
              action={<Link href="/calendar" className={linkButton}>View calendar</Link>}
            />
            {calendarEntries.length === 0 ? (
              <EmptyState message="No calendar entries this month." hint="Create entries through the calendar API." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {calendarEntries.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {entry.name || `Event ${shortId(entry.event_id)}`}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(entry.scheduled_publish_date)} ·{' '}
                        {relativeDays(entry.scheduled_publish_date, now)}
                        {entry.platforms.length ? ` · ${entry.platforms.join(', ')}` : ''}
                      </p>
                    </div>
                    <CalendarBadge status={entry.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent Job Status"
              icon={<span aria-hidden>⚡</span>}
              description={`${approvedJobs} approved · ${failedJobs} failed in this list`}
              action={<Link href="/history" className={linkButton}>History</Link>}
            />
            {recentJobs.length === 0 ? (
              <EmptyState message="No design jobs yet." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentJobs.map((job) => (
                  <li key={job.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-slate-900 dark:text-slate-100" title={job.id}>
                        {shortId(job.id)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(job.created_at)} · retry {job.retry_count}/{job.max_retries}
                      </p>
                      {job.error_message ? (
                        <p className="mt-0.5 truncate text-xs text-red-500" title={job.error_message}>
                          {job.error_message}
                        </p>
                      ) : null}
                    </div>
                    <DesignJobBadge status={job.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Recent Generated Assets"
            icon={<span aria-hidden>🎨</span>}
            description="Approved jobs load their PNG through GET /api/designs/:id/result"
            action={<Link href="/designs" className={linkButton}>All jobs</Link>}
          />
          {recentJobs.length === 0 ? (
            <EmptyState message="No design jobs to display." />
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentJobs.slice(0, 3).map((job) => {
                const approved = job.status.toUpperCase() === 'APPROVED';
                return (
                  <div key={job.id} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex aspect-[1200/630] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                      {approved && jobs.live ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/backend/api/designs/${encodeURIComponent(job.id)}/result`}
                          alt={`Generated asset for design job ${job.id}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="px-3 text-center text-xs text-slate-400 dark:text-slate-600">
                          {approved ? 'Sample asset not loaded' : 'Asset available after approval'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3">
                      <p className="truncate font-mono text-xs text-slate-700 dark:text-slate-300" title={job.id}>
                        {shortId(job.id)}
                      </p>
                      <DesignJobBadge status={job.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  FileImage,
  Image as ImageIcon,
  Radio,
  School,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ConnectionBanner } from '@/components/connection-banner';
import { CalendarBadge, DesignJobBadge, SocialStatusBadges } from '@/components/status';
import { Card, CardHeader, EmptyState, StatTile } from '@/components/ui';
import { isApiConfigured, isSchoolConfigured } from '@/lib/api';
import {
  getCalendar,
  getRecentJobs,
  getSocialStatus,
  getSuccessRates,
  getSystemStats,
  getToday,
  getTodayEvents,
  getTopEvents,
} from '@/lib/data';
import { formatDate, formatDateTime, relativeDays } from '@/lib/format';

export const dynamic = 'force-dynamic';

const linkButton =
  'inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted';

function shortId(id: string): string {
  return `${id.slice(0, 8)}…`;
}

export default async function DashboardPage() {
  const [stats, calendar, jobs, today, todayEvents, social, successRates, topEvents] =
    await Promise.all([
      getSystemStats(),
      getCalendar(),
      getRecentJobs(20),
      getToday(),
      getTodayEvents(),
      getSocialStatus(),
      getSuccessRates(),
      getTopEvents(5),
    ]);

  const live =
    stats.live && calendar.live && jobs.live && today.live && social.live;
  const error =
    [stats.error, calendar.error, jobs.error, today.error, todayEvents.error, social.error]
      .filter(Boolean)
      .join(' · ') || undefined;
  const now = new Date();
  const calendarEntries = [...calendar.data]
    .sort(
      (a, b) => +new Date(a.scheduled_publish_date) - +new Date(b.scheduled_publish_date),
    )
    .slice(0, 5);
  const recentJobs = [...jobs.data]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 5);
  const approvedJobs = recentJobs.filter((job) => job.status.toUpperCase() === 'APPROVED').length;
  const failedJobs = recentJobs.filter((job) => job.status.toUpperCase() === 'FAILED').length;
  const configuredPlatforms = Object.values(social.data).filter(Boolean).length;

  return (
    <>
      <ConnectionBanner
        live={live}
        error={error}
        configured={isApiConfigured()}
        requiresSchool
        schoolConfigured={isSchoolConfigured()}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Live system totals, Nepal calendar, and recent design jobs.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-right">
          <p className="text-xs text-muted-foreground">Today in Nepal</p>
          <p className="text-sm font-medium text-foreground">
            {today.data.nepali_date.formatted}
          </p>
          <p className="text-[11px] text-muted-foreground">{today.data.ad_date} AD</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Schools" value={stats.data.schools} sublabel="registered" tone="blue" icon={<School className="h-4 w-4" />} />
        <StatTile label="Events" value={stats.data.events} sublabel="in the database" tone="violet" icon={<CalendarDays className="h-4 w-4" />} />
        <StatTile label="Design jobs" value={stats.data.jobs} sublabel="all time" tone="amber" icon={<Sparkles className="h-4 w-4" />} />
        <StatTile label="Assets" value={stats.data.assets} sublabel="generated files" tone="green" icon={<FileImage className="h-4 w-4" />} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Today's events"
            icon={<CalendarDays className="h-4 w-4" />}
            description="GET /api/events/:schoolId/today"
          />
          {todayEvents.data.length === 0 ? (
            <EmptyState message="No school events scheduled for today." />
          ) : (
            <ul className="divide-y divide-border">
              {todayEvents.data.map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{event.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {event.event_type.replaceAll('_', ' ')}
                      {event.preferred_design_type ? ` · ${event.preferred_design_type}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Social platforms"
            icon={<Radio className="h-4 w-4" />}
            description="GET /api/social/status — credentials only, never tokens"
            action={
              <Link href="/settings" className={linkButton}>
                Settings
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            }
          />
          <div className="space-y-3 px-5 py-4">
            <SocialStatusBadges status={social.data} />
            <p className="text-xs text-muted-foreground">
              {configuredPlatforms} of 3 platforms have live credentials.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader
              title="Content Calendar"
              icon={<CalendarDays className="h-4 w-4" />}
              description="Entries returned by GET /api/calendar/:schoolId for this month"
              action={
                <Link href="/calendar" className={linkButton}>
                  View calendar
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              }
            />
            {calendarEntries.length === 0 ? (
              <EmptyState message="No calendar entries this month." hint="Sync festivals or create entries through the calendar API." />
            ) : (
              <ul className="divide-y divide-border">
                {calendarEntries.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {entry.name || `Event ${shortId(entry.event_id)}`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
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
              icon={<Zap className="h-4 w-4" />}
              description={`${approvedJobs} approved · ${failedJobs} failed in this list`}
              action={
                <Link href="/history" className={linkButton}>
                  History
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              }
            />
            {recentJobs.length === 0 ? (
              <EmptyState message="No design jobs yet." />
            ) : (
              <ul className="divide-y divide-border">
                {recentJobs.map((job) => (
                  <li key={job.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-foreground" title={job.id}>
                        {shortId(job.id)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {formatDateTime(job.created_at)} · retry {job.retry_count}/{job.max_retries}
                      </p>
                      {job.error_message ? (
                        <p className="mt-0.5 truncate text-xs text-danger" title={job.error_message}>
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Success rate by event type"
            description="GET /api/analytics/success-rate/:schoolId"
          />
          {successRates.data.length === 0 ? (
            <EmptyState message="No analytics yet." />
          ) : (
            <ul className="divide-y divide-border">
              {successRates.data.map((row) => (
                <li key={row.event_type} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {row.event_type.replaceAll('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.successful}/{row.total} approved
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {row.success_rate}%
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Top events"
            description="GET /api/analytics/top-events/:schoolId"
          />
          {topEvents.data.length === 0 ? (
            <EmptyState message="No event analytics yet." />
          ) : (
            <ul className="divide-y divide-border">
              {topEvents.data.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.quality_approved_count} quality-approved assets
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {row.design_count}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Recent Generated Assets"
            icon={<ImageIcon className="h-4 w-4" />}
            description="Approved jobs load their PNG through GET /api/designs/:id/result"
            action={
              <Link href="/designs" className={linkButton}>
                All jobs
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            }
          />
          {recentJobs.length === 0 ? (
            <EmptyState message="No design jobs to display." />
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentJobs.slice(0, 3).map((job) => {
                const approved = job.status.toUpperCase() === 'APPROVED';
                return (
                  <div key={job.id} className="overflow-hidden rounded-lg border border-border">
                    <div className="flex aspect-[1200/630] items-center justify-center bg-muted">
                      {approved && jobs.live ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/backend/api/designs/${encodeURIComponent(job.id)}/result`}
                          alt={`Generated asset for design job ${job.id}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 px-3 text-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground/60" aria-hidden />
                          <span className="text-xs text-muted-foreground">
                            {approved ? 'Sample asset not loaded' : 'Asset available after approval'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3">
                      <p className="truncate font-mono text-xs text-muted-foreground" title={job.id}>
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

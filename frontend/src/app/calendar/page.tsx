import Link from 'next/link';
import { ConnectionBanner } from '@/components/connection-banner';
import { RequestDesignButton } from '@/components/job-actions';
import { CalendarBadge } from '@/components/status';
import { Badge, Button, Card, CardHeader, EmptyState } from '@/components/ui';
import { isApiConfigured, isSchoolConfigured } from '@/lib/api';
import { getCalendar } from '@/lib/data';
import { formatDate, relativeDays } from '@/lib/format';

export const dynamic = 'force-dynamic';

function parseOffset(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? 0);
  return Number.isInteger(parsed) ? Math.max(-24, Math.min(24, parsed)) : 0;
}

function monthLabel(offset: number): string {
  const kathmanduParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date());
  const year = Number(kathmanduParts.find((part) => part.type === 'year')?.value);
  const month = Number(kathmanduParts.find((part) => part.type === 'month')?.value);
  const target = new Date(Date.UTC(year, month - 1 + offset, 1));
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(target);
}

const monthLink =
  'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ monthOffset?: string | string[] }>;
}) {
  const offset = parseOffset((await searchParams).monthOffset);
  const calendar = await getCalendar(offset);
  const now = new Date();
  const entries = [...calendar.data].sort(
    (a, b) => +new Date(a.scheduled_publish_date) - +new Date(b.scheduled_publish_date),
  );
  const pending = entries.filter((entry) => entry.status !== 'published');
  const published = entries.filter((entry) => entry.status === 'published');

  return (
    <>
      <ConnectionBanner
        live={calendar.live}
        error={calendar.error}
        configured={isApiConfigured()}
        requiresSchool
        schoolConfigured={isSchoolConfigured()}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Content Calendar</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Scheduled publishing entries for {monthLabel(offset)}, with Bikram Sambat dates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/calendar?monthOffset=${offset - 1}`} className={monthLink} aria-label="Previous month">
            ←
          </Link>
          {offset !== 0 ? <Link href="/calendar" className={monthLink}>Current month</Link> : null}
          <Link href={`/calendar?monthOffset=${offset + 1}`} className={monthLink} aria-label="Next month">
            →
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader
          title={`Draft & scheduled (${pending.length})`}
          icon={<span aria-hidden>📅</span>}
          description="Data from GET /api/calendar/:schoolId"
        />
        {pending.length === 0 ? (
          <EmptyState message={`No draft or scheduled entries in ${monthLabel(offset)}.`} />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {pending.map((entry) => (
              <li key={entry.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {entry.name || `Event ${entry.event_id.slice(0, 8)}…`}
                      </p>
                      {entry.event_type ? <Badge tone="violet">{entry.event_type}</Badge> : null}
                      <CalendarBadge status={entry.status} />
                    </div>
                    {entry.description ? (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{entry.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                      Publish {formatDate(entry.scheduled_publish_date)}
                      <span className="font-normal text-slate-400 dark:text-slate-500">
                        {' '}· {relativeDays(entry.scheduled_publish_date, now)}
                        {entry.nepali_date ? ` · ${entry.nepali_date.formatted}` : ''}
                      </span>
                    </p>
                    {entry.caption ? (
                      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                        {entry.caption}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {entry.platforms.map((platform) => <Badge key={platform} tone="blue">{platform}</Badge>)}
                      {entry.hashtags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {calendar.live ? (
                      <RequestDesignButton eventId={entry.event_id} />
                    ) : (
                      <Button variant="primary" disabled title="Connect the live backend first">
                        Generate design
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title={`Published (${published.length})`} icon={<span aria-hidden>✓</span>} />
        {published.length === 0 ? (
          <EmptyState message={`No published entries in ${monthLabel(offset)}.`} />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {published.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-700 dark:text-slate-300">
                    {entry.name || `Event ${entry.event_id.slice(0, 8)}…`}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(entry.scheduled_publish_date)}
                    {entry.platforms.length ? ` · ${entry.platforms.join(', ')}` : ''}
                  </p>
                </div>
                <CalendarBadge status={entry.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

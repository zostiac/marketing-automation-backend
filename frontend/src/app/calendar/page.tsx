import Link from 'next/link';
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, Landmark } from 'lucide-react';
import {
  PublishDueButton,
  PublishEntryButton,
  SyncFestivalsButton,
} from '@/components/calendar-actions';
import { ConnectionBanner } from '@/components/connection-banner';
import { DesignOptions } from '@/components/design-options';
import { CalendarBadge } from '@/components/status';
import { Badge, Card, CardHeader, EmptyState } from '@/components/ui';
import { isApiConfigured, isSchoolConfigured } from '@/lib/api';
import { getCalendar, getFestivals, getToday } from '@/lib/data';
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
  'inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted';

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ monthOffset?: string | string[] }>;
}) {
  const offset = parseOffset((await searchParams).monthOffset);
  const today = await getToday();
  const bsYear = today.data.nepali_date.year;
  const [calendar, festivals] = await Promise.all([
    getCalendar(offset),
    getFestivals(bsYear, offset === 0 ? today.data.nepali_date.month : undefined),
  ]);
  const now = new Date();
  const entries = [...calendar.data].sort(
    (a, b) => +new Date(a.scheduled_publish_date) - +new Date(b.scheduled_publish_date),
  );
  const pending = entries.filter((entry) => entry.status === 'draft' || entry.status === 'scheduled');
  const failed = entries.filter((entry) => entry.status === 'failed');
  const published = entries.filter((entry) => entry.status === 'published');
  const live = calendar.live && today.live;
  const error = [calendar.error, today.error, festivals.error].filter(Boolean).join(' · ') || undefined;

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
          <h2 className="text-xl font-semibold text-foreground">Content Calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Scheduled publishing entries for {monthLabel(offset)}. Today is{' '}
            {today.data.nepali_date.formatted} ({today.data.ad_date} AD).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/calendar?monthOffset=${offset - 1}`} className={monthLink} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Link>
          {offset !== 0 ? <Link href="/calendar" className={monthLink}>Current month</Link> : null}
          <Link href={`/calendar?monthOffset=${offset + 1}`} className={monthLink} aria-label="Next month">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      {calendar.live ? (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <SyncFestivalsButton bsYear={bsYear} />
          <PublishDueButton />
        </div>
      ) : null}

      <Card className="mb-6">
        <CardHeader
          title={`Nepal festivals (${festivals.data.length})`}
          icon={<Landmark className="h-4 w-4" />}
          description={
            offset === 0
              ? `GET /api/calendar/festivals?year=${bsYear}&month=${today.data.nepali_date.month}`
              : `GET /api/calendar/festivals?year=${bsYear}`
          }
        />
        {festivals.data.length === 0 ? (
          <EmptyState message={`No curated festivals for BS ${bsYear}.`} />
        ) : (
          <ul className="divide-y divide-border">
            {festivals.data.slice(0, 12).map((festival) => (
              <li key={`${festival.bs_year}-${festival.bs_month}-${festival.bs_day}-${festival.name}`} className="flex items-start justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {festival.name}{' '}
                    <span className="font-normal text-muted-foreground">{festival.name_nepali}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {festival.nepali_date.formatted} · {festival.ad_date} AD
                    {festival.is_public_holiday ? ' · public holiday' : ''}
                  </p>
                </div>
                <Badge tone="violet">{festival.scope}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mb-6">
        <CardHeader
          title={`Draft & scheduled (${pending.length})`}
          icon={<CalendarDays className="h-4 w-4" />}
          description="Data from GET /api/calendar/:schoolId"
        />
        {pending.length === 0 ? (
          <EmptyState message={`No draft or scheduled entries in ${monthLabel(offset)}.`} />
        ) : (
          <ul className="divide-y divide-border">
            {pending.map((entry) => (
              <li key={entry.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {entry.name || `Event ${entry.event_id.slice(0, 8)}…`}
                      </p>
                      {entry.event_type ? <Badge tone="violet">{entry.event_type}</Badge> : null}
                      <CalendarBadge status={entry.status} />
                    </div>
                    {entry.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">{entry.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs font-medium text-foreground">
                      Publish {formatDate(entry.scheduled_publish_date)}
                      <span className="font-normal text-muted-foreground">
                        {' '}· {relativeDays(entry.scheduled_publish_date, now)}
                        {entry.nepali_date ? ` · ${entry.nepali_date.formatted}` : ''}
                      </span>
                    </p>
                    {entry.caption ? (
                      <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                        {entry.caption}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {entry.platforms.map((platform) => <Badge key={platform} tone="blue">{platform}</Badge>)}
                      {entry.hashtags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {calendar.live ? (
                      <>
                        <DesignOptions
                          eventId={entry.event_id}
                          eventName={entry.name || `Event ${entry.event_id.slice(0, 8)}`}
                          description={entry.description}
                          eventType={entry.event_type}
                          eventDate={entry.event_date}
                          platforms={entry.platforms}
                          canGenerate={calendar.live}
                        />
                        {entry.status === 'scheduled' ? <PublishEntryButton entryId={entry.id} /> : null}
                      </>
                    ) : (
                      <DesignOptions
                        eventId={entry.event_id}
                        eventName={entry.name || `Event ${entry.event_id.slice(0, 8)}`}
                        description={entry.description}
                        eventType={entry.event_type}
                        eventDate={entry.event_date}
                        platforms={entry.platforms}
                        canGenerate={false}
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {failed.length > 0 ? (
        <Card className="mb-6">
          <CardHeader title={`Failed publishes (${failed.length})`} />
          <ul className="divide-y divide-border">
            {failed.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {entry.name || `Event ${entry.event_id.slice(0, 8)}…`}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(entry.scheduled_publish_date)}
                    {entry.platforms.length ? ` · ${entry.platforms.join(', ')}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarBadge status={entry.status} />
                  {calendar.live ? <PublishEntryButton entryId={entry.id} /> : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardHeader title={`Published (${published.length})`} icon={<CheckCircle2 className="h-4 w-4" />} />
        {published.length === 0 ? (
          <EmptyState message={`No published entries in ${monthLabel(offset)}.`} />
        ) : (
          <ul className="divide-y divide-border">
            {published.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {entry.name || `Event ${entry.event_id.slice(0, 8)}…`}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
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

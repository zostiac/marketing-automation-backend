import { ConnectionBanner } from '@/components/connection-banner';
import { OccasionBadge } from '@/components/status';
import { Badge, Button, Card, CardHeader, EmptyState } from '@/components/ui';
import { isApiConfigured } from '@/lib/api';
import { getOccasions } from '@/lib/data';
import { formatDate, relativeDays } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function OccasionsPage() {
  const occasions = await getOccasions();
  const now = new Date();

  const sorted = [...occasions.data].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const upcoming = sorted.filter((o) => o.status !== 'completed' && o.status !== 'skipped');
  const past = sorted.filter((o) => o.status === 'completed' || o.status === 'skipped').reverse();

  return (
    <>
      <ConnectionBanner
        live={occasions.live}
        error={occasions.error}
        configured={isApiConfigured()}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Occasions</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Festivals detected from the Nepali calendar, plus campaigns you add yourself.
          </p>
        </div>
        <Button variant="primary" size="md">
          + Add occasion
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader
          title={`Upcoming (${upcoming.length})`}
          icon={<span aria-hidden>📅</span>}
        />
        {upcoming.length === 0 ? (
          <EmptyState message="Nothing upcoming." />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcoming.map((o) => (
              <li key={o.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {o.name}
                      </p>
                      {o.nameNepali ? (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {o.nameNepali}
                        </span>
                      ) : null}
                      <Badge tone={o.source === 'auto' ? 'blue' : 'neutral'}>
                        {o.source === 'auto' ? 'Auto-detected' : 'Manual'}
                      </Badge>
                    </div>
                    {o.description ? (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {o.description}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {formatDate(o.date)}
                      <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">
                        · {relativeDays(o.date, now)} · {o.designCount} design
                        {o.designCount === 1 ? '' : 's'}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <OccasionBadge status={o.status} />
                    <Button>Generate design</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title={`Past (${past.length})`} icon={<span aria-hidden>✓</span>} />
        {past.length === 0 ? (
          <EmptyState message="No past occasions." />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {past.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-700 dark:text-slate-300">{o.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(o.date)} · {o.designCount} design{o.designCount === 1 ? '' : 's'}
                  </p>
                </div>
                <OccasionBadge status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

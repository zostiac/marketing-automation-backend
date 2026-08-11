import { ConnectionBanner } from '@/components/connection-banner';
import { RetryJobButton } from '@/components/job-actions';
import { DesignJobBadge } from '@/components/status';
import { Button, Card, CardHeader, EmptyState, StatTile } from '@/components/ui';
import { isApiConfigured } from '@/lib/api';
import { getJobMetrics, getRecentJobs } from '@/lib/data';
import { formatDateTime, formatDuration } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const [jobs, metrics] = await Promise.all([getRecentJobs(100), getJobMetrics()]);
  const metricCount = (status: string) =>
    metrics.data.find((metric) => metric.status.toUpperCase() === status)?.count ?? 0;
  const sorted = [...jobs.data].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const live = jobs.live && metrics.live;
  const error = [jobs.error, metrics.error].filter(Boolean).join(' · ') || undefined;

  return (
    <>
      <ConnectionBanner live={live} error={error} configured={isApiConfigured()} />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Job History</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Recent design_jobs rows and aggregate status counts from the admin API.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Approved" value={metricCount('APPROVED')} tone="green" />
        <StatTile label="Failed" value={metricCount('FAILED')} tone={metricCount('FAILED') > 0 ? 'red' : 'neutral'} />
        <StatTile label="Processing" value={metricCount('PROCESSING')} tone={metricCount('PROCESSING') > 0 ? 'amber' : 'neutral'} />
        <StatTile label="Queued" value={metricCount('QUEUED')} tone="blue" />
      </div>

      <Card>
        <CardHeader
          title="Recent design jobs"
          icon={<span aria-hidden>🕓</span>}
          description="GET /api/admin/jobs/recent (up to 100 rows)"
        />
        {sorted.length === 0 ? (
          <EmptyState message="No design jobs recorded yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-2.5 font-medium">Job / request</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Created</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Duration</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Retries</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Status</th>
                  <th scope="col" className="px-5 py-2.5 font-medium"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sorted.map((job) => {
                  const failed = job.status.toUpperCase() === 'FAILED';
                  return (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100" title={job.id}>
                          {job.id.slice(0, 8)}…
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-400" title={job.design_request_id}>
                          request {job.design_request_id.slice(0, 8)}…
                        </p>
                        {job.error_message ? (
                          <p className="mt-1 max-w-md text-xs font-mono text-red-600 dark:text-red-400">
                            {job.error_message}
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(job.created_at)}
                        {job.started_at ? <p className="mt-0.5 text-[10px] text-slate-400">Started {formatDateTime(job.started_at)}</p> : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {formatDuration(job.generation_time_ms ?? undefined)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {job.retry_count} / {job.max_retries}
                      </td>
                      <td className="px-5 py-3"><DesignJobBadge status={job.status} /></td>
                      <td className="px-5 py-3 text-right">
                        {failed && jobs.live ? <RetryJobButton jobId={job.id} /> : null}
                        {failed && !jobs.live ? <Button disabled>Retry</Button> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

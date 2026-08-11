import { ConnectionBanner } from '@/components/connection-banner';
import { RetryJobButton } from '@/components/job-actions';
import { DesignJobBadge } from '@/components/status';
import { Button, Card, EmptyState } from '@/components/ui';
import { isApiConfigured } from '@/lib/api';
import { getRecentJobs } from '@/lib/data';
import { formatDateTime, formatDuration } from '@/lib/format';
import type { DesignJob } from '@/lib/types';

export const dynamic = 'force-dynamic';

const actionLink =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';

function shortId(id: string): string {
  return `${id.slice(0, 8)}…`;
}

function JobCard({ job, live }: { job: DesignJob; live: boolean }) {
  const status = job.status.toUpperCase();
  const approved = status === 'APPROVED';
  const failed = status === 'FAILED';
  const imageUrl = `/api/backend/api/designs/${encodeURIComponent(job.id)}/result`;

  return (
    <Card className="overflow-hidden">
      <div className="relative flex aspect-[1200/630] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {approved && live ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={`Result for design job ${job.id}`} className="h-full w-full object-cover" />
        ) : (
          <div className="px-4 text-center">
            <p className="text-3xl" aria-hidden>
              {status === 'PROCESSING' ? '⏳' : failed ? '⚠️' : status === 'QUEUED' ? '🕓' : '🖼️'}
            </p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-600">
              {status === 'PROCESSING'
                ? 'Generation in progress'
                : failed
                  ? 'Generation failed'
                  : status === 'QUEUED'
                    ? 'Waiting in queue'
                    : 'Sample result not loaded'}
            </p>
          </div>
        )}
        <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white" title={job.id}>
          {shortId(job.id)}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Design job</p>
            <DesignJobBadge status={job.status} />
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400" title={job.design_request_id}>
            Request {job.design_request_id}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Created {formatDateTime(job.created_at)}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">
            <dt className="text-slate-400">Generation</dt>
            <dd className="mt-0.5 text-slate-700 dark:text-slate-300">{formatDuration(job.generation_time_ms ?? undefined)}</dd>
          </div>
          <div className="rounded bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">
            <dt className="text-slate-400">Retries</dt>
            <dd className="mt-0.5 text-slate-700 dark:text-slate-300">{job.retry_count} / {job.max_retries}</dd>
          </div>
        </dl>

        {job.prompt ? (
          <p className="line-clamp-3 text-xs italic text-slate-400 dark:text-slate-500">
            &ldquo;{job.prompt}&rdquo;
          </p>
        ) : null}

        {job.error_message ? (
          <p className="rounded bg-red-50 px-2 py-1 font-mono text-[11px] text-red-700 dark:bg-red-950 dark:text-red-300">
            {job.error_message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {approved && live ? (
            <>
              <a href={imageUrl} target="_blank" rel="noreferrer" className={actionLink}>Preview</a>
              <a href={imageUrl} download={`design-${job.id}.png`} className={actionLink}>⬇ Download</a>
            </>
          ) : null}
          {failed && live ? <RetryJobButton jobId={job.id} /> : null}
          {!live ? <Button disabled title="Connect the live backend to use job actions">Actions unavailable</Button> : null}
          {status === 'PROCESSING' || status === 'QUEUED' ? (
            <Button disabled title="Use the job status endpoint to monitor progress">
              {status === 'PROCESSING' ? '⏳ Processing…' : '🕓 Queued'}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default async function DesignsPage() {
  const jobs = await getRecentJobs(100);
  const ordered = [...jobs.data].sort((a, b) => {
    const priority = (status: string) => status.toUpperCase() === 'FAILED' ? 0 : status.toUpperCase() === 'PROCESSING' ? 1 : status.toUpperCase() === 'QUEUED' ? 2 : 3;
    return priority(a.status) - priority(b.status) || +new Date(b.created_at) - +new Date(a.created_at);
  });
  const active = ordered.filter((job) => job.status.toUpperCase() !== 'APPROVED');
  const approved = ordered.filter((job) => job.status.toUpperCase() === 'APPROVED');

  return (
    <>
      <ConnectionBanner live={jobs.live} error={jobs.error} configured={isApiConfigured()} />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Design Jobs</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Queue state and generated results from the backend&apos;s design job records.
        </p>
      </div>

      {active.length > 0 ? (
        <section className="mb-8">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <span aria-hidden>⚡</span> Active or needs attention ({active.length})
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {active.map((job) => <JobCard key={job.id} job={job} live={jobs.live} />)}
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Approved jobs ({approved.length})
        </h3>
        {approved.length === 0 ? (
          <Card>
            <EmptyState message="No approved design jobs yet." hint="Request a design from a live calendar entry." />
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {approved.map((job) => <JobCard key={job.id} job={job} live={jobs.live} />)}
          </div>
        )}
      </section>
    </>
  );
}

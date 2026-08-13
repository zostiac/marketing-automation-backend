import {
  AlertTriangle,
  Clock,
  Download,
  ExternalLink,
  Hourglass,
  ImageIcon,
  Loader2,
  Zap,
} from 'lucide-react';
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
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function shortId(id: string): string {
  return `${id.slice(0, 8)}…`;
}

function Placeholder({ status }: { status: string }) {
  const map: Record<string, { icon: typeof Clock; label: string }> = {
    PROCESSING: { icon: Loader2, label: 'Generation in progress' },
    FAILED: { icon: AlertTriangle, label: 'Generation failed' },
    QUEUED: { icon: Hourglass, label: 'Waiting in queue' },
  };
  const item = map[status] ?? { icon: ImageIcon, label: 'Sample result not loaded' };
  const Icon = item.icon;
  return (
    <div className="flex flex-col items-center gap-2 px-4 text-center">
      <Icon
        className={`h-7 w-7 text-muted-foreground/60 ${status === 'PROCESSING' ? 'animate-spin' : ''}`}
        aria-hidden
      />
      <p className="text-xs text-muted-foreground">{item.label}</p>
    </div>
  );
}

function JobCard({ job, live }: { job: DesignJob; live: boolean }) {
  const status = job.status.toUpperCase();
  const approved = status === 'APPROVED';
  const failed = status === 'FAILED';
  const imageUrl = `/api/backend/api/designs/${encodeURIComponent(job.id)}/result`;

  return (
    <Card className="overflow-hidden">
      <div className="relative flex aspect-[1200/630] items-center justify-center bg-muted">
        {approved && live ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={`Result for design job ${job.id}`} className="h-full w-full object-cover" />
        ) : (
          <Placeholder status={status} />
        )}
        <span
          className="absolute right-2 top-2 rounded bg-foreground/70 px-1.5 py-0.5 font-mono text-[10px] text-background"
          title={job.id}
        >
          {shortId(job.id)}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Design job</p>
            <DesignJobBadge status={job.status} />
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground" title={job.design_request_id}>
            Request {job.design_request_id}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Created {formatDateTime(job.created_at)}</p>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-muted px-2 py-1.5">
            <dt className="text-muted-foreground">Generation</dt>
            <dd className="mt-0.5 font-medium text-foreground">{formatDuration(job.generation_time_ms ?? undefined)}</dd>
          </div>
          <div className="rounded-md bg-muted px-2 py-1.5">
            <dt className="text-muted-foreground">Retries</dt>
            <dd className="mt-0.5 font-medium text-foreground">{job.retry_count} / {job.max_retries}</dd>
          </div>
        </dl>

        {job.prompt ? (
          <p className="line-clamp-3 text-xs italic text-muted-foreground">&ldquo;{job.prompt}&rdquo;</p>
        ) : null}

        {job.error_message ? (
          <p className="rounded-md bg-danger-muted px-2 py-1 font-mono text-[11px] text-danger">
            {job.error_message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          {approved && live ? (
            <>
              <a href={imageUrl} target="_blank" rel="noreferrer" className={actionLink}>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Preview
              </a>
              <a href={imageUrl} download={`design-${job.id}.png`} className={actionLink}>
                <Download className="h-3.5 w-3.5" aria-hidden />
                Download
              </a>
            </>
          ) : null}
          {failed && live ? <RetryJobButton jobId={job.id} /> : null}
          {!live ? <Button disabled title="Connect the live backend to use job actions">Actions unavailable</Button> : null}
          {status === 'PROCESSING' || status === 'QUEUED' ? (
            <Button disabled title="Use the job status endpoint to monitor progress">
              {status === 'PROCESSING' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Clock className="h-3.5 w-3.5" aria-hidden />
              )}
              {status === 'PROCESSING' ? 'Processing…' : 'Queued'}
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
    const priority = (status: string) =>
      status.toUpperCase() === 'FAILED'
        ? 0
        : status.toUpperCase() === 'PROCESSING'
          ? 1
          : status.toUpperCase() === 'QUEUED'
            ? 2
            : 3;
    return priority(a.status) - priority(b.status) || +new Date(b.created_at) - +new Date(a.created_at);
  });
  const active = ordered.filter((job) => job.status.toUpperCase() !== 'APPROVED');
  const approved = ordered.filter((job) => job.status.toUpperCase() === 'APPROVED');

  return (
    <>
      <ConnectionBanner live={jobs.live} error={jobs.error} configured={isApiConfigured()} />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Design Jobs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Queue state and generated results from the backend&apos;s design job records.
        </p>
      </div>

      {active.length > 0 ? (
        <section className="mb-8">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Zap className="h-4 w-4 text-warning" aria-hidden /> Active or needs attention ({active.length})
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {active.map((job) => <JobCard key={job.id} job={job} live={jobs.live} />)}
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Approved jobs ({approved.length})</h3>
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

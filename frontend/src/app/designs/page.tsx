import { ConnectionBanner } from '@/components/connection-banner';
import { DesignBadge } from '@/components/status';
import { Button, Card, EmptyState } from '@/components/ui';
import { isApiConfigured } from '@/lib/api';
import { getDesigns } from '@/lib/data';
import { formatDateTime } from '@/lib/format';
import type { Design } from '@/lib/types';

export const dynamic = 'force-dynamic';

function DesignCard({ design }: { design: Design }) {
  const { status } = design;
  return (
    <Card className="overflow-hidden">
      <div className="relative flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {design.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={design.imageUrl} alt={design.title} className="h-full w-full object-cover" />
        ) : (
          <div className="px-4 text-center">
            <p className="text-3xl" aria-hidden>
              {status === 'generating' ? '⏳' : status === 'failed' ? '⚠️' : '🖼️'}
            </p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-600">
              {status === 'generating'
                ? 'Generating…'
                : status === 'failed'
                  ? 'Generation failed'
                  : 'No preview available'}
            </p>
          </div>
        )}
        <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
          v{design.version}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{design.title}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {design.occasionName} · {formatDateTime(design.createdAt)}
          </p>
        </div>

        <DesignBadge status={status} />

        {design.prompt ? (
          <p className="line-clamp-2 text-xs italic text-slate-400 dark:text-slate-500">
            &ldquo;{design.prompt}&rdquo;
          </p>
        ) : null}

        {design.error ? (
          <p className="rounded bg-red-50 px-2 py-1 font-mono text-[11px] text-red-700 dark:bg-red-950 dark:text-red-300">
            {design.error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          {status === 'pending_approval' ? (
            <>
              <Button variant="primary">✓ Approve</Button>
              <Button variant="danger">✕ Reject</Button>
            </>
          ) : null}
          {status === 'approved' ? (
            <>
              <Button variant="primary">📧 Send</Button>
              <Button>⬇ Download</Button>
            </>
          ) : null}
          {status === 'failed' || status === 'rejected' ? (
            <Button variant="primary">↻ Regenerate</Button>
          ) : null}
          {status === 'generating' ? (
            <Button disabled title="Generation in progress">
              ⏳ Working…
            </Button>
          ) : null}
          {status !== 'generating' ? <Button variant="ghost">Preview</Button> : null}
        </div>
      </div>
    </Card>
  );
}

export default async function DesignsPage() {
  const designs = await getDesigns();

  const pending = designs.data.filter((d) => d.status === 'pending_approval');
  const rest = designs.data.filter((d) => d.status !== 'pending_approval');

  return (
    <>
      <ConnectionBanner live={designs.live} error={designs.error} configured={isApiConfigured()} />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Designs</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review generated posters, approve what works, regenerate what doesn&apos;t.
        </p>
      </div>

      {pending.length > 0 ? (
        <section className="mb-8">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <span aria-hidden>🔔</span> Waiting for your approval ({pending.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pending.map((d) => (
              <DesignCard key={d.id} design={d} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          All designs ({rest.length})
        </h3>
        {rest.length === 0 ? (
          <Card>
            <EmptyState
              message="No designs yet."
              hint="Designs appear here once the pipeline generates them for an occasion."
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rest.map((d) => (
              <DesignCard key={d.id} design={d} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

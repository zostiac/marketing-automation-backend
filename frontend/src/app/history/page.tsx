import { ConnectionBanner } from '@/components/connection-banner';
import { RunBadge } from '@/components/status';
import { Card, CardHeader, EmptyState, StatTile } from '@/components/ui';
import { isApiConfigured } from '@/lib/api';
import { getRuns } from '@/lib/data';
import { formatDateTime, formatDuration } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const runs = await getRuns();

  const succeeded = runs.data.filter((r) => r.status === 'success').length;
  const failed = runs.data.filter((r) => r.status === 'failed').length;
  const running = runs.data.filter((r) => r.status === 'running').length;

  const sorted = [...runs.data].sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt));

  return (
    <>
      <ConnectionBanner live={runs.live} error={runs.error} configured={isApiConfigured()} />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Generation History
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Every automation step, and whether it succeeded.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatTile label="Succeeded" value={succeeded} tone="green" />
        <StatTile label="Failed" value={failed} tone={failed > 0 ? 'red' : 'neutral'} />
        <StatTile label="Running" value={running} tone={running > 0 ? 'amber' : 'neutral'} />
      </div>

      <Card>
        <CardHeader title="Run log" icon={<span aria-hidden>🕓</span>} />
        {sorted.length === 0 ? (
          <EmptyState message="No runs recorded yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-2.5 font-medium">Step</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Occasion</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Started</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Duration</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sorted.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{r.step}</p>
                      {r.message ? (
                        <p
                          className={`mt-0.5 text-xs ${
                            r.status === 'failed'
                              ? 'font-mono text-red-600 dark:text-red-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {r.message}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {r.occasionName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {formatDateTime(r.startedAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      {formatDuration(r.durationMs)}
                    </td>
                    <td className="px-5 py-3">
                      <RunBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

import Link from 'next/link';

/**
 * Honest degraded-state banner. Shown whenever the dashboard is rendering sample
 * data because the backend didn't answer — so nobody mistakes demo numbers for real ones.
 */
export function ConnectionBanner({
  live,
  error,
  configured,
}: {
  live: boolean;
  error?: string;
  configured: boolean;
}) {
  if (live) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/50">
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 text-lg leading-none">
          ⚠️
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            {configured
              ? 'Backend unreachable — showing sample data'
              : 'Backend not configured — showing sample data'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
            {configured ? (
              <>
                The dashboard could not reach your API, so every figure below is placeholder
                data. Nothing here reflects your real campaigns.
              </>
            ) : (
              <>
                Set <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900">API_URL</code>{' '}
                in Vercel → Settings → Environment Variables, then redeploy. Env changes only
                apply to new deployments.
              </>
            )}
          </p>
          {error ? (
            <p className="mt-1.5 truncate font-mono text-[11px] text-amber-700 dark:text-amber-400">
              {error}
            </p>
          ) : null}
          <Link
            href="/settings"
            className="mt-2 inline-block text-xs font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700 dark:text-amber-200"
          >
            Check connection status →
          </Link>
        </div>
      </div>
    </div>
  );
}

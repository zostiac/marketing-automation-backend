import Link from 'next/link';

/** Shown whenever at least one section is using the labelled sample fallback. */
export function ConnectionBanner({
  live,
  error,
  configured,
  requiresSchool = false,
  schoolConfigured = true,
}: {
  live: boolean;
  error?: string;
  configured: boolean;
  requiresSchool?: boolean;
  schoolConfigured?: boolean;
}) {
  if (live) return null;

  const missingApi = !configured;
  const missingSchool = requiresSchool && !schoolConfigured;
  const title = missingApi
    ? 'Backend not configured — showing sample data'
    : missingSchool
      ? 'School not configured — showing sample data'
      : 'Backend request failed — showing sample data';

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/50">
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 text-lg leading-none">⚠️</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
            {missingApi ? (
              <>
                Set <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900">API_URL</code>{' '}
                in the frontend environment and redeploy.
              </>
            ) : missingSchool ? (
              <>
                School-scoped API routes require <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900">SCHOOL_ID</code>{' '}
                in the frontend environment.
              </>
            ) : (
              <>One or more sections could not load from Express. Labelled fallback values are not production data.</>
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

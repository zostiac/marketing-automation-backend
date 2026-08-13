import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

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
    <div className="mb-6 rounded-lg border border-warning/30 bg-warning-muted px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-warning">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-warning/90">
            {missingApi ? (
              <>
                Set <code className="rounded bg-warning/10 px-1 py-0.5 font-mono">API_URL</code>{' '}
                in the frontend environment and redeploy.
              </>
            ) : missingSchool ? (
              <>
                School-scoped API routes require{' '}
                <code className="rounded bg-warning/10 px-1 py-0.5 font-mono">SCHOOL_ID</code>{' '}
                in the frontend environment.
              </>
            ) : (
              <>
                One or more sections could not load from Express. Labelled fallback values are not
                production data.
              </>
            )}
          </p>
          {error ? (
            <p className="mt-1.5 truncate font-mono text-[11px] text-warning/80">{error}</p>
          ) : null}
          <Link
            href="/settings"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-warning underline-offset-2 hover:underline"
          >
            Check connection status
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';

/* ---------------------------------------------------------------- Card ---- */

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  icon,
  action,
  description,
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {icon}
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------- Badge ---- */

export type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-900',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900',
  red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-900',
};

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------- Button ---- */

export function Button({
  children,
  variant = 'secondary',
  size = 'sm',
  type = 'button',
  disabled,
  title,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  type?: 'button' | 'submit';
  disabled?: boolean;
  title?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900';
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-3.5 py-2 text-sm' };
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary:
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    danger:
      'border border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-slate-800 dark:text-red-300 dark:hover:bg-red-950',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      title={title}
      className={`${base} ${sizes[size]} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------- Empty state ---- */

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p> : null}
    </div>
  );
}

/* ---------------------------------------------------------- Stat tile ----- */

export function StatTile({
  label,
  value,
  sublabel,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: BadgeTone;
}) {
  const accent: Record<BadgeTone, string> = {
    neutral: 'text-slate-900 dark:text-slate-100',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    red: 'text-red-600 dark:text-red-400',
    violet: 'text-violet-600 dark:text-violet-400',
  };
  return (
    <Card className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${accent[tone]}`}>{value}</p>
      {sublabel ? (
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sublabel}</p>
      ) : null}
    </Card>
  );
}

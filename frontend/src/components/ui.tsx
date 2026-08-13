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
      className={`rounded-lg border border-border bg-card text-card-foreground shadow-sm ${className}`}
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
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {icon ? <span className="text-muted-foreground">{icon}</span> : null}
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------- Badge ---- */

export type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-muted-foreground ring-border',
  blue: 'bg-info-muted text-info ring-info/20',
  green: 'bg-success-muted text-success ring-success/20',
  amber: 'bg-warning-muted text-warning ring-warning/20',
  red: 'bg-danger-muted text-danger ring-danger/20',
  violet: 'bg-violet-muted text-violet ring-violet/20',
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
    'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-3.5 py-2 text-sm' };
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'border border-border bg-card text-foreground hover:bg-muted',
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    danger: 'border border-danger/30 bg-danger-muted text-danger hover:bg-danger/10',
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
    <div className="px-5 py-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p> : null}
    </div>
  );
}

/* ---------------------------------------------------------- Stat tile ----- */

export function StatTile({
  label,
  value,
  sublabel,
  tone = 'neutral',
  icon,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: BadgeTone;
  icon?: ReactNode;
}) {
  const accent: Record<BadgeTone, string> = {
    neutral: 'text-foreground',
    blue: 'text-info',
    green: 'text-success',
    amber: 'text-warning',
    red: 'text-danger',
    violet: 'text-violet',
  };
  const iconWrap: Record<BadgeTone, string> = {
    neutral: 'bg-muted text-muted-foreground',
    blue: 'bg-info-muted text-info',
    green: 'bg-success-muted text-success',
    amber: 'bg-warning-muted text-warning',
    red: 'bg-danger-muted text-danger',
    violet: 'bg-violet-muted text-violet',
  };
  return (
    <Card className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={`mt-1.5 text-2xl font-semibold tabular-nums ${accent[tone]}`}>{value}</p>
          {sublabel ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
          ) : null}
        </div>
        {icon ? (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconWrap[tone]}`}>
            {icon}
          </span>
        ) : null}
      </div>
    </Card>
  );
}

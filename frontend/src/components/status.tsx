import { Badge, type BadgeTone } from './ui';
import type { CalendarStatus, DesignJobStatus } from '@/lib/types';

const JOB: Record<DesignJobStatus, { label: string; tone: BadgeTone }> = {
  QUEUED: { label: 'Queued', tone: 'blue' },
  PROCESSING: { label: 'Processing', tone: 'amber' },
  APPROVED: { label: 'Approved', tone: 'green' },
  FAILED: { label: 'Failed', tone: 'red' },
};

const CALENDAR: Record<CalendarStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  scheduled: { label: 'Scheduled', tone: 'blue' },
  published: { label: 'Published', tone: 'green' },
};

export function DesignJobBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase() as DesignJobStatus;
  const item = JOB[normalized] ?? { label: status || 'Unknown', tone: 'neutral' as BadgeTone };
  return <Badge tone={item.tone}>{item.label}</Badge>;
}

export function CalendarBadge({ status }: { status: CalendarStatus }) {
  const item = CALENDAR[status] ?? { label: status || 'Unknown', tone: 'neutral' as BadgeTone };
  return <Badge tone={item.tone}>{item.label}</Badge>;
}

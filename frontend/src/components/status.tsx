import { Badge, type BadgeTone } from './ui';
import type { ChannelStatus, DesignStatus, OccasionStatus, RunStatus } from '@/lib/types';

const OCCASION: Record<OccasionStatus, { label: string; tone: BadgeTone }> = {
  detected: { label: 'Detected', tone: 'violet' },
  upcoming: { label: 'Upcoming', tone: 'blue' },
  in_progress: { label: 'In progress', tone: 'amber' },
  completed: { label: 'Completed', tone: 'green' },
  skipped: { label: 'Skipped', tone: 'neutral' },
};

const DESIGN: Record<DesignStatus, { label: string; tone: BadgeTone }> = {
  generating: { label: 'Generating', tone: 'amber' },
  pending_approval: { label: 'Needs approval', tone: 'violet' },
  approved: { label: 'Approved', tone: 'green' },
  rejected: { label: 'Rejected', tone: 'neutral' },
  failed: { label: 'Failed', tone: 'red' },
};

const CHANNEL: Record<ChannelStatus, { label: string; tone: BadgeTone }> = {
  connected: { label: 'Connected', tone: 'green' },
  disconnected: { label: 'Not linked', tone: 'neutral' },
  error: { label: 'Error', tone: 'red' },
};

const RUN: Record<RunStatus, { label: string; tone: BadgeTone }> = {
  success: { label: 'Success', tone: 'green' },
  failed: { label: 'Failed', tone: 'red' },
  running: { label: 'Running', tone: 'amber' },
};

export function OccasionBadge({ status }: { status: OccasionStatus }) {
  const s = OCCASION[status] ?? OCCASION.upcoming;
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function DesignBadge({ status }: { status: DesignStatus }) {
  const s = DESIGN[status] ?? DESIGN.generating;
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function ChannelBadge({ status }: { status: ChannelStatus }) {
  const s = CHANNEL[status] ?? CHANNEL.disconnected;
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function RunBadge({ status }: { status: RunStatus }) {
  const s = RUN[status] ?? RUN.running;
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/** Shared domain types for the marketing-automation dashboard. */

export type OccasionStatus = 'detected' | 'upcoming' | 'in_progress' | 'completed' | 'skipped';

export interface Occasion {
  id: string;
  name: string;
  nameNepali?: string;
  date: string; // ISO date
  status: OccasionStatus;
  /** Where the occasion came from: auto-detected from the calendar, or added by hand. */
  source: 'auto' | 'manual';
  description?: string;
  designCount: number;
}

export type DesignStatus = 'generating' | 'pending_approval' | 'approved' | 'rejected' | 'failed';

export interface Design {
  id: string;
  occasionId: string;
  occasionName: string;
  title: string;
  status: DesignStatus;
  /** Public URL or data URI for the poster preview. */
  imageUrl?: string;
  prompt?: string;
  createdAt: string;
  approvedAt?: string;
  error?: string;
  version: number;
}

export type ChannelStatus = 'connected' | 'disconnected' | 'error';

export interface Channel {
  id: string;
  name: string;
  kind: 'email' | 'facebook' | 'instagram' | 'whatsapp';
  status: ChannelStatus;
  detail?: string;
  lastUsedAt?: string;
}

export type RunStatus = 'success' | 'failed' | 'running';

export interface AutomationRun {
  id: string;
  occasionName: string;
  step: string;
  status: RunStatus;
  startedAt: string;
  durationMs?: number;
  message?: string;
}

export interface Branding {
  schoolName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
}

export interface DashboardStats {
  upcomingOccasions: number;
  pendingApproval: number;
  postersThisMonth: number;
  lastEmailSentAt: string | null;
}

/** Envelope returned by the API layer so the UI can show degraded state honestly. */
export interface ApiResult<T> {
  data: T;
  /** True when the live backend answered; false when we fell back to sample data. */
  live: boolean;
  error?: string;
}

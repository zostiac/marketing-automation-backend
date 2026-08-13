/**
 * Frontend representations of the Express API contracts in `src/routes/index.ts`.
 * Backend/database field names intentionally remain snake_case so contract drift is
 * visible instead of being hidden behind a second, frontend-only domain model.
 */

export interface ApiResult<T> {
  data: T;
  /** True when the value came from the backend; false when sample data was used. */
  live: boolean;
  error?: string;
}

export interface SystemStats {
  schools: number;
  events: number;
  jobs: number;
  assets: number;
}

export type DesignJobStatus = 'QUEUED' | 'PROCESSING' | 'APPROVED' | 'FAILED';

export interface DesignJob {
  id: string;
  design_request_id: string;
  status: DesignJobStatus | string;
  prompt?: string | null;
  generation_time_ms?: number | null;
  error_message?: string | null;
  retry_count: number;
  max_retries: number;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface JobMetric {
  status: DesignJobStatus | string;
  count: number;
}

export type CalendarStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface NepaliDateInfo {
  year: number;
  month: number;
  day: number;
  iso: string;
  formatted: string;
  formatted_nepali: string;
  month_name: string;
  month_name_nepali: string;
  weekday: string;
  weekday_nepali: string;
}

export interface ContentCalendarRecord {
  id: string;
  school_id: string;
  event_id: string;
  scheduled_publish_date: string;
  platforms: string[];
  status: CalendarStatus;
  caption?: string | null;
  hashtags: string[];
  name?: string | null;
  description?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  nepali_date: NepaliDateInfo | null;
  created_at?: string;
  updated_at?: string;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok';

export type SocialPlatformStatus = Record<SocialPlatform, boolean>;

export interface NepalToday {
  ad_date: string;
  nepali_date: NepaliDateInfo;
}

export interface NepalFestival {
  bs_year: number;
  bs_month: number;
  bs_day: number;
  name: string;
  name_nepali: string;
  description: string;
  scope: string;
  is_public_holiday: boolean;
  ad_date: string;
  nepali_date: NepaliDateInfo;
  category?: string;
  content?: {
    caption_template?: string;
    hashtags?: string[];
  };
}

export interface SchoolEvent {
  id: string;
  school_id: string;
  name: string;
  event_date: string;
  event_type: string;
  description?: string | null;
  relevance?: string | null;
  preferred_design_type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SuccessRateRow {
  event_type: string;
  total: number;
  successful: number;
  success_rate: number;
}

export interface TopEventRow {
  id: string;
  name: string;
  design_count: number;
  avg_file_size: number | null;
  quality_approved_count: number;
}

export interface EntryPublishResult {
  entryId: string;
  status: 'published' | 'scheduled' | 'failed' | 'skipped';
  error?: string;
}

export interface PublishRunResult {
  processed: number;
  published: number;
  failed: number;
  skipped: number;
  entries: EntryPublishResult[];
}

export interface FestivalSyncResult {
  count: number;
  events: SchoolEvent[];
}

export interface SchoolBranding {
  name: string;
  tagline?: string | null;
  logo_url?: string | null;
  brand_colors?: Record<string, string> | null;
  typography?: Record<string, unknown> | null;
  visual_style?: string | null;
}

export interface SchoolProfile {
  id: string;
  name: string;
  tagline?: string | null;
  location?: string | null;
  official_logo_url?: string | null;
  brand_colors?: Record<string, string> | null;
  typography?: Record<string, unknown> | null;
  visual_style?: string | null;
  logo_protection_rules?: Record<string, unknown> | null;
  design_preferences?: Record<string, unknown> | null;
  social_media_info?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

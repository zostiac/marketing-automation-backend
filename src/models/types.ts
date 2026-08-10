export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface School extends BaseEntity {
  name: string;
  slug: string;
  domain: string;
  brandColor: string;
  logoUrl?: string;
  settings: SchoolSettings;
}

export interface SchoolSettings {
  autoPublish: boolean;
  defaultTemplate: string;
  socialAccounts: SocialAccount[];
}

export interface SocialAccount {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  accountId: string;
  accessToken: string;
}

export interface Event extends BaseEntity {
  schoolId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  imageUrl?: string;
  status: 'draft' | 'scheduled' | 'published' | 'cancelled';
  designJobId?: string;
}

export interface DesignJob extends BaseEntity {
  schoolId: string;
  eventId?: string;
  type: 'event-poster' | 'social-post' | 'email-header' | 'flyer';
  prompt: string;
  status: 'pending' | 'generating' | 'review' | 'approved' | 'rejected';
  assets: Asset[];
  metadata: DesignJobMetadata;
}

export interface DesignJobMetadata {
  templateId?: string;
  variations: number;
  qualityScore?: number;
  aiProvider: 'openai' | 'stable-diffusion' | 'midjourney';
  model: string;
  parameters: Record<string, unknown>;
}

export interface Asset extends BaseEntity {
  designJobId: string;
  url: string;
  thumbnailUrl: string;
  type: 'image' | 'video' | 'document';
  mimeType: string;
  size: number;
  dimensions?: { width: number; height: number };
  variantIndex: number;
  approved: boolean;
}

export interface QueueJobData {
  designJobId: string;
  priority: number;
  attempts: number;
}

export interface ScheduledTaskData {
  eventId: string;
  schoolId: string;
  runAt: Date;
}

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Database row types (snake_case, matching schema.sql)
export interface DbDesignJob {
  id: string;
  design_request_id: string;
  status: string;
  prompt: string;
  generation_time_ms: number;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

export interface DbAsset {
  id: string;
  design_job_id: string;
  event_id?: string;
  design_type: string;
  storage_location: string;
  storage_bucket: string;
  file_size_bytes: number;
  mime_type: string;
  metadata?: Record<string, any>;
  quality_status: 'PENDING_REVIEW' | 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';
  quality_notes?: string;
  created_at: Date;
  approved_at?: Date;
}

export interface DbGenerationHistory {
  id: string;
  event_id?: string;
  design_type: string;
  prompt: string;
  creative_direction: Record<string, any>;
  asset_id?: string;
  generation_provider: string;
  duration_ms: number;
  created_at: Date;
}
export interface School {
  id: string;
  name: string;
  tagline?: string;
  location?: string;
  official_logo_url?: string;
  brand_colors?: Record<string, string>;
  typography?: Record<string, any>;
  visual_style?: string;
  logo_protection_rules?: Record<string, any>;
  design_preferences?: Record<string, any>;
  social_media_info?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Event {
  id: string;
  school_id: string;
  name: string;
  event_date: Date;
  event_type: string;
  description?: string;
  relevance?: string;
  design_requirement?: string;
  preferred_design_type?: string;
  custom_instructions?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DesignRequest {
  id: string;
  school_id: string;
  event_id: string;
  design_type: string;
  status: 'PENDING' | 'PROCESSING' | 'GENERATED' | 'REVIEWING' | 'APPROVED' | 'DELIVERED' | 'FAILED';
  requested_at: Date;
  completed_at?: Date;
}

export interface CreativeDirection {
  id: string;
  design_request_id: string;
  concept: string;
  composition: string;
  layout: string;
  visual_hierarchy: string;
  typography: string;
  color_usage: string;
  imagery: string;
  illustration_style: string;
  background: string;
  logo_integration: string;
  mood: string;
  created_at: Date;
}

export interface DesignJob {
  id: string;
  design_request_id: string;
  status: string;
  prompt?: string;
  generation_time_ms?: number;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

export interface Asset {
  id: string;
  design_job_id: string;
  event_id?: string;
  design_type: string;
  storage_location: string;
  storage_bucket: string;
  file_size_bytes: number;
  mime_type: string;
  metadata?: Record<string, any>;
  quality_status: string;
  quality_notes?: string;
  created_at: Date;
  approved_at?: Date;
}
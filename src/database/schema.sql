-- Enable pgcrypto extension for gen_random_uuid support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  location VARCHAR(255),
  official_logo_url VARCHAR(500),
  brand_colors JSONB,
  typography JSONB,
  visual_style VARCHAR(50),
  logo_protection_rules JSONB,
  design_preferences JSONB,
  social_media_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS school_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS school_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  plan VARCHAR(50) DEFAULT 'free',
  monthly_design_limit INTEGER DEFAULT 10,
  design_count INTEGER DEFAULT 0,
  billing_date TIMESTAMP,
  next_reset_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(school_id)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  description TEXT,
  relevance VARCHAR(255),
  design_requirement VARCHAR(255),
  preferred_design_type VARCHAR(50),
  custom_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(school_id, name, event_date)
);

-- Design requests table
CREATE TABLE IF NOT EXISTS design_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  event_id UUID REFERENCES events(id),
  design_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Creative directions table
CREATE TABLE IF NOT EXISTS creative_directions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_request_id UUID NOT NULL REFERENCES design_requests(id),
  concept TEXT,
  composition TEXT,
  layout VARCHAR(255),
  visual_hierarchy TEXT,
  typography TEXT,
  color_usage TEXT,
  imagery TEXT,
  illustration_style VARCHAR(100),
  background TEXT,
  logo_integration TEXT,
  mood VARCHAR(100),
  dos JSONB,
  donts JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Design jobs table
CREATE TABLE IF NOT EXISTS design_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_request_id UUID NOT NULL REFERENCES design_requests(id),
  status VARCHAR(50) DEFAULT 'QUEUED',
  prompt TEXT,
  generation_time_ms INTEGER,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_job_id UUID NOT NULL REFERENCES design_jobs(id),
  event_id UUID REFERENCES events(id),
  design_type VARCHAR(50),
  storage_location VARCHAR(500),
  storage_bucket VARCHAR(100),
  file_size_bytes INTEGER,
  mime_type VARCHAR(50),
  metadata JSONB,
  quality_status VARCHAR(50) DEFAULT 'PENDING_REVIEW',
  quality_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP
);

-- Content calendar table
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  scheduled_publish_date TIMESTAMP NOT NULL,
  platforms JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  caption TEXT,
  hashtags JSONB,
  published_at TIMESTAMP,
  publish_results JSONB,
  publish_error TEXT,
  publish_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generation history table
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  design_type VARCHAR(50),
  prompt TEXT,
  creative_direction JSONB,
  asset_id UUID REFERENCES assets(id),
  generation_provider VARCHAR(100),
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20),
  service VARCHAR(100),
  message TEXT,
  error_details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_school_id ON events(school_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_design_requests_school_id ON design_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_design_requests_event_id ON design_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_design_jobs_status ON design_jobs(status);
CREATE INDEX IF NOT EXISTS idx_assets_event_id ON assets(event_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_school_id ON content_calendar(school_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_publish_date
  ON content_calendar(scheduled_publish_date);
CREATE INDEX IF NOT EXISTS idx_generation_history_event_id ON generation_history(event_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

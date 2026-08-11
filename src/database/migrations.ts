import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { db } from '../config/database';

export const fallbackSchemaSql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE TABLE IF NOT EXISTS design_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  event_id UUID REFERENCES events(id),
  design_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20),
  service VARCHAR(100),
  message TEXT,
  error_details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
`;

export async function runMigrations() {
  console.log('Running database migrations...');
  try {
    let schemaSql = fallbackSchemaSql;
    const possiblePaths = [
      path.join(__dirname, 'schema.sql'),
      path.join(__dirname, '../src/database/schema.sql'),
      path.join(process.cwd(), 'src/database/schema.sql'),
      path.join(process.cwd(), 'dist/database/schema.sql'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        schemaSql = fs.readFileSync(p, 'utf8');
        break;
      }
    }

    await db.query(schemaSql);

    // Compatibility upgrades for databases created with the previous schema
    const compatibilityQueries = [
      `ALTER TABLE content_calendar ALTER COLUMN scheduled_publish_date TYPE TIMESTAMP USING scheduled_publish_date::timestamp`,
      `ALTER TABLE content_calendar ALTER COLUMN platforms DROP NOT NULL`,
      `ALTER TABLE content_calendar ALTER COLUMN platforms DROP DEFAULT`,
      `ALTER TABLE content_calendar ALTER COLUMN hashtags DROP NOT NULL`,
      `ALTER TABLE content_calendar ALTER COLUMN hashtags DROP DEFAULT`,
      `ALTER TABLE content_calendar ALTER COLUMN status TYPE VARCHAR(50)`,
      `ALTER TABLE content_calendar ALTER COLUMN status SET DEFAULT 'draft'`,
      `ALTER TABLE content_calendar ADD COLUMN IF NOT EXISTS published_at TIMESTAMP`,
      `DROP INDEX IF EXISTS idx_content_calendar_school_date`,
      `DROP INDEX IF EXISTS idx_content_calendar_event_id`,
      `CREATE INDEX IF NOT EXISTS idx_content_calendar_school_id ON content_calendar(school_id)`,
      `CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_publish_date ON content_calendar(scheduled_publish_date)`,
      `DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'content_calendar'::regclass AND contype = 'c' LOOP IF r.conname LIKE '%status%' OR r.conname LIKE '%platforms%' OR r.conname LIKE '%hashtags%' THEN EXECUTE format('ALTER TABLE content_calendar DROP CONSTRAINT IF EXISTS %I', r.conname); END IF; END LOOP; END $$;`,
    ];

    for (const q of compatibilityQueries) {
      try {
        await db.query(q);
      } catch {
        // ignore — best-effort upgrade for older schemas
      }
    }

    console.log('✓ Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  runMigrations()
    .then(async () => {
      await db.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await db.end();
      process.exit(1);
    });
}

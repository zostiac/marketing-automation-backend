export const config = {
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  database_url: process.env.DATABASE_URL || '',
  redis_url: process.env.REDIS_URL || '',
  bucket_name: process.env.BUCKET_NAME || '',
  bucket_region: process.env.BUCKET_REGION || '',
  bucket_endpoint: process.env.BUCKET_ENDPOINT || '',
  bucket_access_key: process.env.BUCKET_ACCESS_KEY || '',
  bucket_secret_key: process.env.BUCKET_SECRET_KEY || '',
  openai_api_key: process.env.OPENAI_API_KEY || '',
  image_generation_provider: process.env.IMAGE_GENERATION_PROVIDER || 'openai',
  max_retries: parseInt(process.env.MAX_RETRIES || '3'),
  job_timeout_ms: parseInt(process.env.JOB_TIMEOUT_MS || '300000'),
  quality_check_enabled: process.env.QUALITY_CHECK_ENABLED === 'true',
  log_level: process.env.LOG_LEVEL || 'info',
  scheduled_check_time: process.env.SCHEDULED_EVENTS_CHECK_TIME || '08:00',
};

// Validate required config on startup
if (process.env.NODE_ENV !== 'test') {
  const required = ['database_url', 'redis_url', 'bucket_name', 'openai_api_key'];
  const missing = required.filter(key => !config[key as keyof typeof config]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
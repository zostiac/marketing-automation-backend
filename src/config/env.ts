export const config = {
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database_url:
    process.env.DATABASE_URL ||
    process.env.DATABASE_PUBLIC_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    '',
  redis_url:
    process.env.REDIS_URL ||
    process.env.REDIS_PUBLIC_URL ||
    process.env.REDIS_PRIVATE_URL ||
    '',
  bucket_name:
    process.env.BUCKET_NAME ||
    process.env.AWS_BUCKET ||
    process.env.S3_BUCKET ||
    process.env.TIGRIS_BUCKET ||
    'school-marketing-assets',
  bucket_region:
    process.env.BUCKET_REGION ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    process.env.S3_REGION ||
    'us-east-1',
  bucket_endpoint:
    process.env.BUCKET_ENDPOINT ||
    process.env.AWS_ENDPOINT_URL_S3 ||
    process.env.AWS_ENDPOINT ||
    process.env.S3_ENDPOINT ||
    process.env.S3_ENDPOINT_URL ||
    '',
  bucket_access_key:
    process.env.BUCKET_ACCESS_KEY ||
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.S3_ACCESS_KEY_ID ||
    process.env.S3_KEY_ID ||
    '',
  bucket_secret_key:
    process.env.BUCKET_SECRET_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.S3_SECRET_ACCESS_KEY ||
    process.env.S3_SECRET_KEY ||
    '',
  openai_api_key: process.env.OPENAI_API_KEY || '',
  openai_chat_model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o',
  openai_image_model: process.env.OPENAI_IMAGE_MODEL || 'dall-e-3',
  image_generation_provider: process.env.IMAGE_GENERATION_PROVIDER || 'openai',
  max_retries: parseInt(process.env.MAX_RETRIES || '3', 10),
  job_timeout_ms: parseInt(process.env.JOB_TIMEOUT_MS || '300000', 10),
  quality_check_enabled: process.env.QUALITY_CHECK_ENABLED === 'true',
  log_level: process.env.LOG_LEVEL || 'info',
  scheduled_check_time: process.env.SCHEDULED_EVENTS_CHECK_TIME || '08:00',
  api_token: (process.env.API_TOKEN || '').trim(),
  publish_check_cron: process.env.PUBLISH_CHECK_CRON || '*/15 * * * *',
};

// Validate required config on startup
if (process.env.NODE_ENV !== 'test') {
  const missing: string[] = [];
  if (!config.database_url) missing.push('DATABASE_URL (or DATABASE_PUBLIC_URL / DATABASE_PRIVATE_URL)');
  if (!config.redis_url) missing.push('REDIS_URL (or REDIS_PUBLIC_URL / REDIS_PRIVATE_URL)');
  if (!config.openai_api_key) missing.push('OPENAI_API_KEY');

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables in Railway / environment:\n  - ${missing.join('\n  - ')}\nPlease set these in your Railway service variables or .env file.`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    } else {
      console.warn(`[WARNING] ${errorMsg}`);
    }
  }
}

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis
  redisUrl: process.env.REDIS_URL || '',

  // AWS/S3
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  bucketName: process.env.BUCKET_NAME || '',

  // AI Providers
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  stableDiffusionUrl: process.env.STABLE_DIFFUSION_URL || '',
  midjourneyApiKey: process.env.MIDJOURNEY_API_KEY || '',

  // Security
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  apiKey: process.env.API_KEY || '',

  // Feature flags
  enableAiGeneration: process.env.ENABLE_AI_GENERATION === 'true',
  enableAutoPublish: process.env.ENABLE_AUTO_PUBLISH === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required config
function validateConfig() {
  const required = ['databaseUrl', 'redisUrl', 'bucketName', 'openaiApiKey'];
  const missing = required.filter(key => !config[key as keyof typeof config]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}
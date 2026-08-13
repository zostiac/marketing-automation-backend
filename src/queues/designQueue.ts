import Queue from 'bull';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const redisUrl = config.redis_url || 'redis://127.0.0.1:6379';

export const designQueue = new Queue('design', redisUrl, {
  redis: {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  },
});

designQueue.on('error', (err) => {
  logger.error('Bull design queue Redis error', { error: err.message });
});

designQueue.on('completed', (job) => {
  logger.info(`Design queue job ${job.id} completed`);
});

designQueue.on('failed', (job, err) => {
  logger.error(`Design queue job ${job?.id} failed`, { error: err.message });
});

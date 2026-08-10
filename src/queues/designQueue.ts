import Queue from 'bull';
import { JobProcessor } from '../services/JobProcessor';
import { config } from '../config/env';

const redisUrl = config.redis_url || 'redis://127.0.0.1:6379';

export const designQueue = new Queue('design', redisUrl, {
  redis: {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  },
});

designQueue.on('error', (err) => {
  console.error('Bull design queue Redis error:', err);
});

designQueue.process(1, async (job) => {
  const { jobId, designRequestId } = job.data;
  await JobProcessor.processDesignJob(jobId, designRequestId);
});

designQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

designQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
